"""Executa o firmware do Wokwi com periféricos virtuais e serve a maquete local."""

import builtins
import json
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Event, Lock, Thread
from time import monotonic
from types import SimpleNamespace


FIRMWARE = Path(__file__).with_name("main.py")
MAQUETE = FIRMWARE.parents[2] / "simulador"
ENTRADAS = {34: "umidade_a", 35: "umidade_b", 32: "nivel"}


class ReiniciarFirmware(Exception):
    """Solicita reinicialização no limite entre ciclos."""


class Irrigacao:
    def __init__(self):
        self.lock = Lock()
        self.reiniciar = Event()
        self.entradas = {"umidade_a": 50.0, "umidade_b": 50.0, "nivel": 78.0}
        self.pinos = {}
        self.pulsos = {}
        self.parar = False
        self.travado = False
        self.mensagem = "Iniciando controlador"
        self.estado = {}
        self.publicar()

    def publicar(self):
        self.estado = {
            **self.entradas,
            "bomba": self.pinos.get(23) == 1,
            "valvula_a": self.pulsos.get(25, 0) >= 2_000_000,
            "valvula_b": self.pulsos.get(26, 0) >= 2_000_000,
            "travado": self.travado,
            "mensagem": self.mensagem,
        }

    def comandar(self, dados):
        if not isinstance(dados, dict) or not dados:
            raise ValueError("Envie pelo menos um comando.")
        if "acao" in dados:
            if len(dados) != 1 or dados["acao"] not in ("parar", "rearmar"):
                raise ValueError("Ação inválida.")
        elif any(
            nome not in self.entradas or type(valor) not in (float, int)
            or not 0 <= valor <= 100
            for nome, valor in dados.items()
        ):
            raise ValueError("As leituras devem estar entre 0 e 100.")
        with self.lock:
            acao = dados.get("acao")
            if acao == "parar":
                self.parar = True
            elif acao == "rearmar":
                self.reiniciar.set()
            else:
                self.entradas.update(dados)

    def executar(self):
        modelo = self

        class Pin:
            IN, OUT, PULL_UP = range(3)

            def __init__(self, numero, modo=None, pull=None, *, value=None):
                self.numero = numero
                if value is not None:
                    self.value(value)

            def value(self, valor=None):
                with modelo.lock:
                    if self.numero == 27:
                        pressionado = modelo.parar
                        modelo.parar = False
                        modelo.travado |= pressionado
                        return int(not pressionado)
                    if valor is not None:
                        modelo.pinos[self.numero] = valor
                    return modelo.pinos.get(self.numero, 0)

        class ADC:
            ATTN_11DB = 3

            def __init__(self, pino):
                self.entrada = ENTRADAS[pino.numero]

            def atten(self, valor):
                pass  # As entradas virtuais já são normalizadas.

            def read_u16(self):
                with modelo.lock:
                    return int(modelo.entradas[self.entrada] * 65535 / 100 + 0.5)

        class PWM:
            def __init__(self, pino, *, freq):
                self.numero = pino.numero

            def duty_ns(self, pulso):
                with modelo.lock:
                    modelo.pulsos[self.numero] = pulso

        def avancar(ms):
            with self.lock:
                self.publicar()
                # Resposta visual fictícia, em pontos percentuais por segundo.
                # Só há aplicação quando bomba e válvula estão acionadas.
                if self.estado["bomba"] and self.entradas["nivel"] > 0:
                    for setor in ("a", "b"):
                        if self.estado[f"valvula_{setor}"]:
                            chave = f"umidade_{setor}"
                            self.entradas[chave] = min(100, self.entradas[chave] + 1.8 * ms / 1000)
                            self.entradas["nivel"] = max(0, self.entradas["nivel"] - 0.8 * ms / 1000)
            if self.reiniciar.wait(ms / 1000):
                raise ReiniciarFirmware

        def registrar(mensagem):
            with self.lock:
                self.mensagem = mensagem.split(" | ", 1)[0]

        def importar(nome, *args, **kwargs):
            return perifericos[nome] if nome in perifericos else builtins.__import__(nome, *args, **kwargs)

        perifericos = {
            "machine": SimpleNamespace(Pin=Pin, ADC=ADC, PWM=PWM),
            "time": SimpleNamespace(
                sleep_ms=avancar,
                ticks_ms=lambda: int(monotonic() * 1000),
                ticks_add=lambda relogio, ms: relogio + ms,
                ticks_diff=lambda agora, prazo: agora - prazo,
            ),
        }
        codigo = compile(FIRMWARE.read_text(encoding="utf-8"), str(FIRMWARE), "exec")
        ambiente = {**vars(builtins), "__import__": importar, "print": registrar}
        while True:
            try:
                exec(codigo, {"__name__": "__main__", "__builtins__": ambiente})
            except ReiniciarFirmware:
                with self.lock:
                    self.reiniciar.clear()
                    self.travado = False
                    self.pinos.clear()
                    self.pulsos.clear()
                    self.mensagem = "Reiniciando controlador"
                    self.publicar()
            except Exception:
                with self.lock:
                    self.pinos.clear()
                    self.pulsos.clear()
                    self.mensagem = "FALHA DO CONTROLADOR"
                    self.publicar()
                raise


def servir():
    irrigacao = Irrigacao()

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(MAQUETE), **kwargs)

        def resposta_json(self, conteudo, codigo=HTTPStatus.OK):
            dados = json.dumps(conteudo).encode()
            self.send_response(codigo)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(dados)))
            self.end_headers()
            self.wfile.write(dados)

        def do_GET(self):
            if self.path != "/api/irrigacao":
                return super().do_GET()
            with irrigacao.lock:
                estado = dict(irrigacao.estado)
            self.resposta_json(estado)

        def do_POST(self):
            if self.path != "/api/irrigacao":
                return self.send_error(HTTPStatus.NOT_FOUND)
            try:
                tamanho = int(self.headers.get("Content-Length", "0"))
                if not 0 < tamanho <= 1024:
                    raise ValueError("Tamanho da solicitação inválido.")
                irrigacao.comandar(json.loads(self.rfile.read(tamanho)))
            except ValueError as erro:
                return self.resposta_json({"erro": str(erro)}, HTTPStatus.BAD_REQUEST)
            self.resposta_json({"ok": True}, HTTPStatus.ACCEPTED)

        def log_request(self, code="-", size="-"):
            if self.path != "/api/irrigacao" or int(code) >= 400:
                super().log_request(code, size)

    with ThreadingHTTPServer(("127.0.0.1", 8000), Handler) as servidor:
        Thread(target=irrigacao.executar, daemon=True).start()
        print("Fazenda Alto: http://127.0.0.1:8000/", flush=True)
        servidor.serve_forever()


if __name__ == "__main__":
    try:
        servir()
    except KeyboardInterrupt:
        pass
