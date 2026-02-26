import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.lgpd_tool import calcular_risco_lgpd

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Backend do App Médico")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=OPENAI_API_KEY)

class RelatoInput(BaseModel):
    texto: str

def carregar_prompt():
    caminho_prompt = os.path.join(os.path.dirname(BASE_DIR), "prompts", "system_prompt.txt")
    with open(caminho_prompt, "r", encoding="utf-8") as file:
        return file.read()

@app.get("/")
async def root():
    return {"status": "ok", "mensagem": "Motor de IA conectado com sucesso!"}

@app.get("/health")
async def health():
    return {"openai_api_key_set": bool(OPENAI_API_KEY)}

@app.post("/api/processar")
async def processar_relato(relato: RelatoInput):
    if not relato.texto:
        raise HTTPException(status_code=400, detail="O texto do relato não pode estar vazio.")

    system_prompt = carregar_prompt()

    texto_usuario = f"Relato clínico:\n{relato.texto}"

    try:
        resposta = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.0,
            top_p=0.1,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": texto_usuario}
            ]
        )

        mensagem = resposta.choices[0].message
        conteudo_json = json.loads(mensagem.content or "{}")

        # Conta entidades removidas e calcula o risco LGPD via função local
        qtd = len(conteudo_json.get("entidades_removidas", []))
        conteudo_json["risco_lgpd"] = calcular_risco_lgpd(qtd)

        return conteudo_json

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
