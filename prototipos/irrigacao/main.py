from machine import ADC, PWM, Pin
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

# Parâmetros de demonstração. As porcentagens representam os potenciômetros.
SOLO_SECO = 30
SOLO_UMIDO = 40
NIVEL_MINIMO = 20
ABERTURA_MS = 500
RELE_LIGADO = 1
RELE_DESLIGADO = 0

bomba = Pin(23, Pin.OUT, value=RELE_DESLIGADO)
parada = Pin(27, Pin.IN, Pin.PULL_UP)
valvulas = (PWM(Pin(25), freq=50), PWM(Pin(26), freq=50))


def selecionar_valvula(setor):
    for indice, servo in enumerate(valvulas):
        servo.duty_ns(2_000_000 if indice == setor else 1_000_000)


def sensor(gpio):
    entrada = ADC(Pin(gpio))
    entrada.atten(ADC.ATTN_11DB)
    return entrada


def percentual(entrada):
    return entrada.read_u16() * 100 / 65535


selecionar_valvula(None)
sensores = (sensor(34), sensor(35))
reservatorio = sensor(32)
setor = None
liberar_bomba = ticks_ms()
travado = False
estado_anterior = None

while True:
    if parada.value() == 0:
        travado = True

    try:
        umidades = tuple(percentual(entrada) for entrada in sensores)
        nivel = percentual(reservatorio)
    except OSError:
        umidades, nivel = None, None

    destino = None
    if travado:
        estado = "PARADA TRAVADA"
    elif nivel is None:
        estado = "FALHA DE LEITURA"
    elif nivel < NIVEL_MINIMO:
        estado = "RESERVATORIO BAIXO"
    else:
        if setor is not None and umidades[setor] < SOLO_UMIDO:
            destino = setor
        else:
            mais_seco = 0 if umidades[0] <= umidades[1] else 1
            if umidades[mais_seco] < SOLO_SECO:
                destino = mais_seco
        estado = "EM ESPERA"

    if destino != setor:
        bomba.value(RELE_DESLIGADO)
        selecionar_valvula(destino)
        setor = destino
        liberar_bomba = ticks_add(ticks_ms(), ABERTURA_MS)

    ligar = setor is not None and ticks_diff(ticks_ms(), liberar_bomba) >= 0
    bomba.value(RELE_LIGADO if ligar else RELE_DESLIGADO)
    if setor is not None:
        estado = ("IRRIGANDO " if ligar else "ABRINDO VALVULA ") + "AB"[setor]

    if estado != estado_anterior:
        if nivel is None:
            print(estado)
        else:
            print("{} | A={:.0f}% B={:.0f}% nivel={:.0f}%".format(
                estado, umidades[0], umidades[1], nivel
            ))
        estado_anterior = estado
    sleep_ms(50)
