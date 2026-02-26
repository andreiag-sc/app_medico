def calcular_risco_lgpd(quantidade_entidades: int) -> dict:
    if quantidade_entidades >= 4:
        return {
            "nivel": "ALTO RISCO",
            "cor": "red",
            "mensagem": "Muitos dados sensíveis detectados. Risco alto de reidentificação do paciente.",
            "entidades_contadas": quantidade_entidades,
        }
    elif quantidade_entidades > 0:
        return {
            "nivel": "RISCO MODERADO",
            "cor": "orange",
            "mensagem": "Alguns dados sensíveis detectados. Requer atenção.",
            "entidades_contadas": quantidade_entidades,
        }
    else:
        return {
            "nivel": "RISCO BAIXO",
            "cor": "green",
            "mensagem": "Nenhum ou poucos dados sensíveis encontrados. Prontuário seguro.",
            "entidades_contadas": quantidade_entidades,
        }
