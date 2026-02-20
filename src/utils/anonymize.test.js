import { describe, it, expect } from "vitest";
import anonymize from "./anonymize";

describe("anonymize util", () => {
  it("replaces CPF with [DOCUMENTO]", () => {
    const input = "Paciente CPF 123.456.789-00 relatou sintomas.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[DOCUMENTO]");
    expect(replacements.some(r => r.original.includes("123.456.789-00"))).toBeTruthy();
  });

  it("replaces CRM with [DOCUMENTO]", () => {
    const input = "Atendido por Dr. José, CRM-SP 123456.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[DOCUMENTO]");
    expect(replacements.some(r => /CRM/i.test(r.original))).toBeTruthy();
  });

  it("replaces patient names with [PACIENTE]", () => {
    const input = "Paciente: Maria Aparecida dos Santos apresentou dor.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[PACIENTE]");
    expect(replacements.some(r => r.tag === "[PACIENTE]")).toBeTruthy();
  });
 
  it("replaces EMEI school names with [INSTITUICAO]", () => {
    const input = "Aluno da EMEI Pequeno Príncipe está com febre.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[INSTITUICAO]");
    expect(replacements.some(r => /EMEI/i.test(r.original))).toBeTruthy();
  });

  it("replaces neighborhood (Jardim Amanda) with [LOCALIZACAO]", () => {
    const input = "Paciente mora no bairro Jardim Amanda desde 2010.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[LOCALIZACAO]");
    expect(replacements.some(r => /Jardim Amanda/i.test(r.original))).toBeTruthy();
  });

  it("replaces Cartão SUS (15 dígitos) with [DOCUMENTO]", () => {
    const input = "Número do Cartão SUS 123456789012345 foi informado.";
    const { text, replacements } = anonymize(input);
    expect(text).toContain("[DOCUMENTO]");
    expect(replacements.some(r => /\d{15}/.test(r.original))).toBeTruthy();
  });
});

