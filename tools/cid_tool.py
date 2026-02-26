"""
Ferramenta para simular busca de códigos CID-10 com busca inteligente.
"""

def buscar_codigo_cid(diagnostico: str) -> dict:
    """
    Busca o código CID-10 e a descrição para uma hipótese diagnóstica.
    
    Args:
        diagnostico: O nome da doença ou condição médica.
        
    Returns:
        Dicionário com o código CID-10, descrição e status da busca.
    """
    diagnostico_lower = diagnostico.strip().lower()
    
    # Nossa base com os casos clínicos que já usamos no protótipo e mais alguns
    banco_cid = {
        "pneumonia": {"codigo": "J18.9", "descricao": "Pneumonia não especificada"},
        "diabetes": {"codigo": "E11", "descricao": "Diabetes mellitus não insulinodependente"},
        "hipertensão": {"codigo": "I10", "descricao": "Hipertensão essencial (primária)"},
        "ectopica": {"codigo": "O00.9", "descricao": "Gravidez ectópica não especificada"},
        "retinopatia": {"codigo": "H36.0", "descricao": "Retinopatia diabética"},
        "gripe": {"codigo": "J11", "descricao": "Influenza com outras manifestações respiratórias"},
        "dengue": {"codigo": "A90", "descricao": "Dengue [dengue clássico]"},
        "infarto": {"codigo": "I21.9", "descricao": "Infarto agudo do miocárdio não especificado"}
    }
    
    # Busca inteligente: procura se a palavra-chave está DENTRO do que a IA mandou
    for chave, dados in banco_cid.items():
        if chave in diagnostico_lower:
            return {
                "encontrado": True,
                "diagnostico_buscado": diagnostico,
                "codigo_cid": dados["codigo"],
                "descricao": dados["descricao"]
            }
            
    # Se não achar nada
    return {
        "encontrado": False,
        "diagnostico_buscado": diagnostico,
        "codigo_cid": None,
        "descricao": "Código não encontrado na base simulada."
    }