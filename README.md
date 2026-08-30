# Wuni

Plataforma de orientação universitária: cruza o perfil acadêmico, financeiro e
de preferências do aluno com uma base de cursos/instituições para recomendar
as melhores opções — com Fit Score, chance de aprovação e filtros completos.

Site estático, sem dependências de build. Os dados de faculdades são
mockados (ilustrativos) e o perfil do usuário fica salvo no `localStorage`
do próprio navegador.

## Páginas

- `index.html` — landing page institucional (Wuni)
- `perfil.html` — formulário de perfil do aluno + teste vocacional
- `recomendacoes.html` — lista filtrável de faculdades/cursos recomendados

## Rodando localmente

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Também é possível abrir `index.html` direto no navegador (duplo clique),
sem precisar de servidor — todas as páginas funcionam com `file://`.

## Estrutura

- `css/style.css` — estilos de todo o site
- `js/data.js` — base mockada de cursos/faculdades, perfil de exemplo e perguntas do teste vocacional
- `js/storage.js` — leitura/gravação do perfil no `localStorage`
- `js/ui.js` — helpers de UI reutilizáveis (chips de seleção múltipla)
- `js/main.js` — menu mobile e animações de entrada (usado em todas as páginas)
- `js/profile.js` — lógica da página de perfil e do teste vocacional
- `js/recommendations.js` — cálculo de Fit Score/chance de aprovação, filtros e ordenação

## Perfil de exemplo

Na primeira visita, o perfil já vem preenchido com um aluno de exemplo
(interesse em Administração, orçamento de até R$ 10.000/mês, aceita
estudar em qualquer lugar) — edite em `perfil.html` a qualquer momento.
