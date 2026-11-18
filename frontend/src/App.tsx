
import { useEffect, useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Menu
} from "lucide-react";
import "./App.css";

// Estrutura dos livros recebidos da API
interface Livro {
  _id: string;
  title: string;
  author: string;
  ano_pub: number;
  classificacao: number;
  num_paginas: number;
  estoque: number;
  genero: string;
  preco: number;
  sku: string;
}

function App() {
  const [menuAberto, setMenuAberto] = useState(true);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Busca os livros cadastrados no backend
  useEffect(() => {
    const buscarLivros = async () => {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch("http://localhost:3000/livros");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os livros.");
        }

        const dados: Livro[] = await resposta.json();
        setLivros(dados);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        setErro("Não foi possível conectar ao servidor.");
      } finally {
        setCarregando(false);
      }
    };

    buscarLivros();
  }, []);

  // Calcula os indicadores do Dashboard
  const totalLivros = livros.length;

  const totalUnidades = livros.reduce(
    (total, livro) => total + livro.estoque,
    0
  );

  // Consideramos estoque baixo quando há 5 unidades ou menos
  const estoqueBaixo = livros.filter(
    (livro) => livro.estoque <= 5
  ).length;

  const valorEstoque = livros.reduce(
    (total, livro) => total + livro.preco * livro.estoque,
    0
  );

  // Formata valores para reais
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  };

  // Pesquisa por título ou autor
  const livrosFiltrados = livros.filter((livro) => {
    const termo = busca.toLowerCase();

    return (
      livro.title.toLowerCase().includes(termo) ||
      livro.author.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="app">
      <aside className={`sidebar ${menuAberto ? "" : "fechada"}`}>
        <div className="logo">
  <img src="/cozy-logo.png" alt="Cozy Book Store" />
</div>

        <nav>
          <p className="nav-titulo">MENU PRINCIPAL</p>

          <a className="ativo">
            <LayoutDashboard size={19} /> Dashboard
          </a>

          <a>
            <BookOpen size={19} /> Livros
          </a>

          <a>
            <Package size={19} /> Estoque
          </a>
        </nav>

        <div className="sidebar-footer">
          <span>📚</span>
          <div>
            <strong>Livraria Estoque</strong>
            <small>Gestão inteligente</small>
          </div>
        </div>
      </aside>

      <main className="conteudo">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Menu size={22} />
          </button>

          <div className="perfil">
            <span>Bem-vindo(a)!</span>
            <div className="avatar">L</div>
          </div>
        </header>

        <section className="pagina">
          <div className="titulo-pagina">
            <div>
              <span className="subtitulo">VISÃO GERAL</span>
              <h1>Dashboard</h1>
              <p>Acompanhe o desempenho da sua livraria.</p>
            </div>

            <button className="botao-principal">
              <Plus size={18} /> Novo livro
            </button>
          </div>

          {erro && (
            <p className="mensagem-erro">{erro}</p>
          )}

          <div className="cards">
            <div className="card">
              <div className="card-icone roxo">
                <BookOpen />
              </div>
              <span>Total de livros</span>
              <h2>{carregando ? "..." : totalLivros}</h2>
              <small>Livros cadastrados</small>
            </div>

            <div className="card">
              <div className="card-icone verde">
                <Package />
              </div>
              <span>Unidades em estoque</span>
              <h2>{carregando ? "..." : totalUnidades}</h2>
              <small>Exemplares disponíveis</small>
            </div>

            <div className="card">
              <div className="card-icone amarelo">
                <AlertTriangle />
              </div>
              <span>Estoque baixo</span>
              <h2>{carregando ? "..." : estoqueBaixo}</h2>
              <small>Precisam de reposição</small>
            </div>

            <div className="card">
              <div className="card-icone azul">
                <TrendingUp />
              </div>
              <span>Valor em estoque</span>
              <h2>
                {carregando ? "..." : formatarMoeda(valorEstoque)}
              </h2>
              <small>Valor dos exemplares</small>
            </div>
          </div>

          <div className="secao-livros">
            <div className="secao-header">
              <div>
                <h2>Seus livros</h2>
                <p>Gerencie os livros cadastrados na livraria.</p>
              </div>

              <div className="busca">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar livro..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {carregando ? (
              <div className="estado-vazio">
                <p>Carregando livros...</p>
              </div>
            ) : livrosFiltrados.length > 0 ? (
              <div className="lista-livros">
                {livrosFiltrados.map((livro) => (
                  <div className="item-livro" key={livro._id}>
                    <div className="livro-info">
                      <strong>{livro.title}</strong>
                      <span>{livro.author}</span>
                    </div>

                    <span className="livro-genero">
                      {livro.genero}
                    </span>

                    <span className="livro-estoque">
                      {livro.estoque} unidades
                    </span>

                    <strong className="livro-preco">
                      {formatarMoeda(livro.preco)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="estado-vazio">
                <div className="livro-ilustracao">
                  <ShoppingBag size={35} />
                </div>

                <h3>
                  {busca
                    ? "Nenhum livro encontrado"
                    : "Nenhum livro por aqui ainda"}
                </h3>

                <p>
                  {busca
                    ? "Tente pesquisar por outro título ou autor."
                    : "Seus livros cadastrados aparecerão nesta seção."}
                </p>

                {!busca && (
                  <button className="botao-principal">
                    <Plus size={18} /> Cadastrar primeiro livro
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
