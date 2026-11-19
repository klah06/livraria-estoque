
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Menu,
  Pencil,
  Trash2,
  X,
  Save
} from "lucide-react";
import "./App.css";

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

interface FormularioLivro {
  title: string;
  author: string;
  ano_pub: string;
  classificacao: string;
  num_paginas: string;
  estoque: string;
  genero: string;
  preco: string;
  sku: string;
}

type Pagina = "dashboard" | "livros" | "estoque";

const formularioInicial: FormularioLivro = {
  title: "",
  author: "",
  ano_pub: "",
  classificacao: "",
  num_paginas: "",
  estoque: "",
  genero: "",
  preco: "",
  sku: ""
};

const API = "http://localhost:3000/livros";

function App() {
  const [menuAberto, setMenuAberto] = useState(true);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState<Pagina>("dashboard");

  const [modalAberto, setModalAberto] = useState(false);
  const [livroEditando, setLivroEditando] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioLivro>(formularioInicial);

  // Carrega os livros da API
  const carregarLivros = useCallback(async () => {
    try {
      setErro("");

      const resposta = await fetch(API);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os livros.");
      }

      const dados: Livro[] = await resposta.json();
      setLivros(dados);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarLivros();
  }, [carregarLivros]);

  // Indicadores do dashboard
  const totalLivros = livros.length;

  const totalUnidades = livros.reduce(
    (total, livro) => total + livro.estoque,
    0
  );

  const estoqueBaixo = livros.filter(
    (livro) => livro.estoque <= 5
  ).length;

  const valorEstoque = livros.reduce(
    (total, livro) => total + livro.preco * livro.estoque,
    0
  );

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);

  // Filtra os livros pela pesquisa e pela página selecionada
  const livrosFiltrados = livros.filter((livro) => {
    const termo = busca.toLowerCase();

    const correspondeBusca =
      livro.title.toLowerCase().includes(termo) ||
      livro.author.toLowerCase().includes(termo) ||
      livro.sku.toLowerCase().includes(termo);

    const correspondeEstoque =
      pagina !== "estoque" || livro.estoque <= 5;

    return correspondeBusca && correspondeEstoque;
  });

  // Abre o formulário para cadastrar
  const abrirCadastro = () => {
    setLivroEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setModalAberto(true);
  };

  // Abre o formulário preenchido para editar
  const abrirEdicao = (livro: Livro) => {
    setLivroEditando(livro._id);

    setFormulario({
      title: livro.title,
      author: livro.author,
      ano_pub: String(livro.ano_pub),
      classificacao: String(livro.classificacao),
      num_paginas: String(livro.num_paginas),
      estoque: String(livro.estoque),
      genero: livro.genero,
      preco: String(livro.preco),
      sku: livro.sku
    });

    setErro("");
    setModalAberto(true);
  };

  // Atualiza os campos do formulário
  const atualizarCampo = (campo: keyof FormularioLivro, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  // Cadastra ou atualiza um livro
  const salvarLivro = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    setSalvando(true);
    setErro("");

    const dadosLivro = {
      title: formulario.title.trim(),
      author: formulario.author.trim(),
      ano_pub: Number(formulario.ano_pub),
      classificacao: Number(formulario.classificacao),
      num_paginas: Number(formulario.num_paginas),
      estoque: Number(formulario.estoque),
      genero: formulario.genero.trim(),
      preco: Number(formulario.preco),
      sku: formulario.sku.trim()
    };

    try {
      const resposta = await fetch(
        livroEditando ? `${API}/${livroEditando}` : API,
        {
          method: livroEditando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dadosLivro)
        }
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem || "Não foi possível salvar o livro.");
      }

      setModalAberto(false);
      setFormulario(formularioInicial);
      setLivroEditando(null);

      await carregarLivros();
    } catch (error) {
      console.error("Erro ao salvar livro:", error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o livro."
      );
    } finally {
      setSalvando(false);
    }
  };

  // Exclui um livro
  const excluirLivro = async (livro: Livro) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir "${livro.title}"?`
    );

    if (!confirmou) return;

    try {
      setErro("");

      const resposta = await fetch(`${API}/${livro._id}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir o livro.");
      }

      await carregarLivros();
    } catch (error) {
      console.error("Erro ao excluir livro:", error);
      setErro("Não foi possível excluir o livro.");
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setLivroEditando(null);
    setFormulario(formularioInicial);
  };

  const tituloPagina = {
    dashboard: "Painel de controle",
    livros: "Seus livros",
    estoque: "Estoque baixo"
  };

  return (
    <div className="app">
      <aside className={`sidebar ${menuAberto ? "" : "fechada"}`}>
        <div className="logo">
          <img src="/cozy-logo.png" alt="Cozy Book Store" />
        </div>

        <nav>
          <p className="nav-titulo">MENU PRINCIPAL</p>

          <a
            href="#dashboard"
            className={pagina === "dashboard" ? "ativo" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPagina("dashboard");
              setBusca("");
            }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a
            href="#livros"
            className={pagina === "livros" ? "ativo" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPagina("livros");
              setBusca("");
            }}
          >
            <BookOpen size={19} />
            <span>Livros</span>
          </a>

          <a
            href="#estoque"
            className={pagina === "estoque" ? "ativo" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPagina("estoque");
              setBusca("");
            }}
          >
            <Package size={19} />
            <span>Estoque</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <span>📚</span>
          <div>
            <strong>Cozy Book Store</strong>
            <small>Gestão inteligente</small>
          </div>
        </div>
      </aside>

      <main className="conteudo">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Abrir ou fechar menu"
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
              <span className="subtitulo">
                {pagina === "dashboard" ? "VISÃO GERAL" : "GERENCIAMENTO"}
              </span>
              <h1>{tituloPagina[pagina]}</h1>
              <p>
                {pagina === "dashboard"
                  ? "Acompanhe o desempenho da sua livraria."
                  : pagina === "livros"
                    ? "Consulte, cadastre e gerencie seus livros."
                    : "Acompanhe os livros que precisam de reposição."}
              </p>
            </div>

            <button className="botao-principal" onClick={abrirCadastro}>
              <Plus size={18} /> Novo livro
            </button>
          </div>

          {erro && <p className="mensagem-erro">{erro}</p>}

          {pagina === "dashboard" && (
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
          )}

          <div className="secao-livros">
            <div className="secao-header">
              <div>
                <h2>
                  {pagina === "estoque"
                    ? "Livros com estoque baixo"
                    : pagina === "livros"
                      ? "Todos os livros"
                      : "Seus livros"}
                </h2>
                <p>
                  {pagina === "estoque"
                    ? "Livros com 5 unidades ou menos."
                    : "Gerencie os livros cadastrados na livraria."}
                </p>
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

                    <span className="livro-genero">{livro.genero}</span>

                    <span className="livro-estoque">
                      {livro.estoque === 0
                        ? "Esgotado"
                        : `${livro.estoque} unidades`}
                    </span>

                    <strong className="livro-preco">
                      {formatarMoeda(livro.preco)}
                    </strong>

                    <div className="acoes-livro">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(livro)}
                        aria-label={`Editar ${livro.title}`}
                        title="Editar livro"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirLivro(livro)}
                        aria-label={`Excluir ${livro.title}`}
                        title="Excluir livro"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
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
                    : pagina === "estoque"
                      ? "Nenhum livro com estoque baixo"
                      : "Nenhum livro por aqui ainda"}
                </h3>

                <p>
                  {busca
                    ? "Tente pesquisar por outro título, autor ou SKU."
                    : pagina === "estoque"
                      ? "Todos os livros estão com estoque acima de 5 unidades."
                      : "Seus livros cadastrados aparecerão nesta seção."}
                </p>

                {pagina !== "estoque" && !busca && (
                  <button
                    className="botao-principal"
                    onClick={abrirCadastro}
                  >
                    <Plus size={18} /> Cadastrar primeiro livro
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {modalAberto && (
        <div className="modal-fundo" onClick={fecharModal}>
          <div
            className="modal-livro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="subtitulo">COZY BOOK STORE</span>
                <h2>{livroEditando ? "Editar livro" : "Novo livro"}</h2>
                <p>Preencha as informações do livro.</p>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModal}
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={salvarLivro}>
              <div className="formulario-grid">
                <label>
                  Título
                  <input
                    required
                    value={formulario.title}
                    onChange={(e) => atualizarCampo("title", e.target.value)}
                    placeholder="Nome do livro"
                  />
                </label>

                <label>
                  Autor
                  <input
                    required
                    value={formulario.author}
                    onChange={(e) => atualizarCampo("author", e.target.value)}
                    placeholder="Nome do autor"
                  />
                </label>

                <label>
                  Ano de publicação
                  <input
                    required
                    type="number"
                    min="0"
                    value={formulario.ano_pub}
                    onChange={(e) => atualizarCampo("ano_pub", e.target.value)}
                  />
                </label>

                <label>
                  Classificação indicativa
                  <input
                    required
                    type="number"
                    min="0"
                    value={formulario.classificacao}
                    onChange={(e) =>
                      atualizarCampo("classificacao", e.target.value)
                    }
                  />
                </label>

                <label>
                  Número de páginas
                  <input
                    required
                    type="number"
                    min="1"
                    value={formulario.num_paginas}
                    onChange={(e) =>
                      atualizarCampo("num_paginas", e.target.value)
                    }
                  />
                </label>

                <label>
                  Quantidade em estoque
                  <input
                    required
                    type="number"
                    min="0"
                    value={formulario.estoque}
                    onChange={(e) => atualizarCampo("estoque", e.target.value)}
                  />
                </label>

                <label>
                  Gênero
                  <input
                    required
                    value={formulario.genero}
                    onChange={(e) => atualizarCampo("genero", e.target.value)}
                    placeholder="Ex.: Romance"
                  />
                </label>

                <label>
                  Preço (R$)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.preco}
                    onChange={(e) => atualizarCampo("preco", e.target.value)}
                    placeholder="0,00"
                  />
                </label>

                <label className="campo-completo">
                  SKU
                  <input
                    required
                    value={formulario.sku}
                    onChange={(e) => atualizarCampo("sku", e.target.value)}
                    placeholder="Ex.: LIV-0003"
                  />
                </label>
              </div>

              {erro && <p className="mensagem-erro">{erro}</p>}

              <div className="modal-acoes">
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="botao-principal"
                  disabled={salvando}
                >
                  <Save size={17} />
                  {salvando
                    ? "Salvando..."
                    : livroEditando
                      ? "Salvar alterações"
                      : "Cadastrar livro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
