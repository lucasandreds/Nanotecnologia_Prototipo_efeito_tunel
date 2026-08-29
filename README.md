# Efeito Túnel e Processadores — Demo Interativa

Este repositório contém uma página estática que demonstra didaticamente o efeito túnel e o impacto térmico de processadores em escala de data centers.

Arquivos importantes
- `index.html` — página principal (duas abas: Interativa e Institucional)
- `styles.css` — estilos e tema
- `script.js` — lógica da simulação, atualizações de UI e exposição de funções globais

Requisitos
- Navegador moderno (Chrome, Firefox, Edge)
- Python 3 (apenas para servir os arquivos localmente)

Como executar localmente
1. Abra um terminal na pasta do projeto (onde estão `index.html` e `script.js`).

2. Inicie um servidor HTTP simples (porta 8001 usada por convenção):

```bash
python3 -m http.server 8001
```

3. Abra no navegador a URL:

```
http://127.0.0.1:8001/index.html
```

Verificações rápidas e uso
- Ao abrir a página, vá até a aba "Interativa".
- Use o slider "Barreira" (`barrierSlider`) e "Energia" (`energySlider`) para ver a animação no canvas e os valores de transmissão (`transmissionValue`) e decaimento (`decayValue`).
- Use o botão "Pausar/Ativar tunelamento" (`toggleWave`) para pausar a animação.
- No painel do transistor, ajuste o slider de nó (`transistorSlider`) para ver alterações em `nodeSizeLabel`, `leakageValue`, `heatBar`, `powerValue` e as métricas do data center `energyValue`, `pueValue`, `co2Value`.

APIs úteis para testes automatizados
As seguintes funções foram expostas no `window` para facilitar testes/integração:
- `window.updateTunnelUI()` — força atualização do painel do túnel
- `window.updateTransistorUI()` — força atualização do painel do transistor
- `window.updateDatacenterUI(size, leakageFactor, chipPower)` — recalcula métricas do data center
- `window.toggleWaveEnabled()` — alterna o estado do tunelamento

Dicas de depuração
- Se algo não responder, abra o console do navegador (F12) e verifique erros.
- Confirme que `script.js` foi carregado sem erros e que as funções acima aparecem em `window` (ex.: `typeof window.updateTunnelUI === 'function'`).

Licença
Material didático; use livremente com atribuição.
