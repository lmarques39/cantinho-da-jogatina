-- ============================================================
-- Corrige a árvore de categorias (parent_id estava tudo NULL)
-- Reconstrói a hierarquia original do WordPress:
--   Videojogos        -> Playstation, Xbox, Nintendo, Retro Gaming, PC Gaming
--   Jogos Soltos      -> PlayStation Soltos, Xbox Soltos, Nintendo Soltos, Retro Soltos
--   Consolas          -> Playstation Consolas, Xbox Consolas, Nintendo Consolas, Retro Consolas
--   Acessórios        -> Comandos e Controladores, Cabos e Adaptadores, Bolsas e Proteção,
--                         Armazenamento e Memória, Box da Jogatina
-- ============================================================

-- Videojogos (pai) -> sub-categorias por plataforma
update categories set parent_id = (select id from categories where slug = 'videojogos')
where slug in ('playstation-jogos', 'xbox-jogos', 'nintendo-jogos', 'retro-jogos', 'pc-gaming');

-- Jogos Soltos (pai) -> sub-categorias por plataforma
update categories set parent_id = (select id from categories where slug = 'jogos-soltos')
where slug in ('playstation-soltos', 'xbox-soltos', 'nintendo-soltos', 'retro-soltos');

-- Consolas (pai) -> sub-categorias por plataforma
update categories set parent_id = (select id from categories where slug = 'consolas')
where slug in ('playstation', 'xbox', 'nintendo', 'retro');

-- Acessórios (pai) -> sub-categorias
update categories set parent_id = (select id from categories where slug = 'acessorios')
where slug in ('comandos-controladores', 'cabos-adaptadores', 'bolsas-protecao',
               'armazenamento-memoria', 'box-jogatina');

-- Confirma o resultado: deve mostrar 4 categorias-pai (parent_id null) com as suas filhas
select c.name as categoria, c.slug, p.name as categoria_pai
from categories c
left join categories p on p.id = c.parent_id
order by coalesce(p.name, c.name), c.parent_id nulls first, c.name;
