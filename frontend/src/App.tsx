
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
  Save,
  LogOut,
  Eye,
  EyeOff
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

interface UsuarioLogado {
  id: string;
  nome: string;
  identificador: string;
  cargo: "administrador" | "funcionario";
}

interface RespostaLogin {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
}

interface Funcionario {
  id: string;
  nome: string;
  identificador: string;
  cargo: "funcionario";
  ativo: boolean;
}

interface FormularioFuncionario {
  nome: string;
  identificador: string;
  senha: string;
  senhaAdministrador: string;
  ativo: boolean;
}

type Pagina = "dashboard" | "livros" | "estoque" | "funcionarios";
type TipoModal = "cadastro" | "edicao" | "estoque";

const API = "http://localhost:3000";

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

const formularioFuncionarioInicial: FormularioFuncionario = {
  nome: "",
  identificador: "",
  senha: "",
  senhaAdministrador: "",
  ativo: true
};

function recuperarUsuario(): UsuarioLogado | null {
  try {
    const usuario = sessionStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) as UsuarioLogado : null;
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || ""
  );

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(
    recuperarUsuario
  );

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);

  const [menuAberto, setMenuAberto] = useState(true);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregandoFuncionarios, setCarregandoFuncionarios] = useState(false);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(
    () => Boolean(sessionStorage.getItem("token"))
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState<Pagina>("dashboard");

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoModal>("cadastro");
  const [livroEditando, setLivroEditando] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioLivro>(formularioInicial);
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] =
    useState<string | null>(null);
  const [formularioFuncionario, setFormularioFuncionario] =
    useState<FormularioFuncionario>(formularioFuncionarioInicial);

  const [mostrarSenhaFuncionario, setMostrarSenhaFuncionario] = useState(false);
  const [mostrarSenhaAdministrador, setMostrarSenhaAdministrador] =
    useState(false);

  const ehAdministrador = usuario?.cargo === "administrador";

  // Encerra a sessão
  const sair = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    setToken("");
    setUsuario(null);
    setLivros([]);
    setFuncionarios([]);
    setSenha("");
    setIdentificador("");
    setErro("");
    setCarregando(false);
    setModalAberto(false);
    setModalFuncionarioAberto(false);
  };

  // Carrega os livros
  const carregarLivros = useCallback(async () => {
    if (!token) {
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch(`${API}/livros`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resposta.status === 401) {
        sair();
        setErro("Sua sessão expirou. Faça login novamente.");
        return;
      }

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
  }, [token]);

  useEffect(() => {
    if (token && usuario) {
      carregarLivros();
    } else {
      setCarregando(false);
    }
  }, [token, usuario, carregarLivros]);

  // Carrega os funcionários
  const carregarFuncionarios = useCallback(async () => {
    if (!token || !ehAdministrador) {
      setFuncionarios([]);
      return;
    }

    setCarregandoFuncionarios(true);

    try {
      const resposta = await fetch(`${API}/usuarios/funcionarios`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resposta.status === 401) {
        sair();
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
          dados?.mensagem || "Não foi possível carregar os funcionários."
        );
      }

      const dados: { funcionarios: Funcionario[] } =
        await resposta.json();

      setFuncionarios(dados.funcionarios);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar funcionários."
      );
    } finally {
      setCarregandoFuncionarios(false);
    }
  }, [token, ehAdministrador]);

  useEffect(() => {
    if (token && ehAdministrador) {
      carregarFuncionarios();
    } else {
      setFuncionarios([]);
    }
  }, [token, ehAdministrador, carregarFuncionarios]);

  // Login
  const realizarLogin = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    setEntrando(true);
    setErro("");

    try {
      const resposta = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identificador, senha })
      });

      const dados = await resposta.json() as Partial<RespostaLogin> & {
        mensagem?: string;
      };

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível realizar o login."
        );
      }

      if (!dados.token || !dados.usuario) {
        throw new Error("O servidor retornou dados de login inválidos.");
      }

      sessionStorage.setItem("token", dados.token);
      sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

      setToken(dados.token);
      setUsuario(dados.usuario);
      setSenha("");
      setMostrarSenha(false);
      setPagina("dashboard");
      setBusca("");
      setCarregando(true);
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login."
      );
    } finally {
      setEntrando(false);
    }
  };

  // Indicadores
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

  // Filtra livros
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

  // Filtra funcionários
  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    const termo = busca.toLowerCase();

    return (
      funcionario.nome.toLowerCase().includes(termo) ||
      funcionario.identificador.toLowerCase().includes(termo)
    );
  });

  // Cadastro de livro
  const abrirCadastro = () => {
    setTipoModal("cadastro");
    setLivroEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setModalAberto(true);
  };

  // Editar livro
  const abrirEdicao = (livro: Livro) => {
    if (!ehAdministrador) return;

    setTipoModal("edicao");
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

  // Atualizar estoque
  const abrirAtualizacaoEstoque = (livro: Livro) => {
    setTipoModal("estoque");
    setLivroEditando(livro._id);
    setQuantidadeEstoque(String(livro.estoque));
    setErro("");
    setModalAberto(true);
  };

  const atualizarCampo = (
    campo: keyof FormularioLivro,
    valor: string
  ) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  // Salvar livro
  const salvarLivro = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    setSalvando(true);
    setErro("");

    try {
      let resposta: Response;

      if (tipoModal === "estoque") {
        const quantidade = Number(quantidadeEstoque);

        if (!Number.isInteger(quantidade) || quantidade < 0) {
          throw new Error(
            "Informe uma quantidade inteira igual ou maior que zero."
          );
        }

        resposta = await fetch(
          `${API}/livros/${livroEditando}/estoque`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ quantidade })
          }
        );
      } else {
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

        resposta = await fetch(
          tipoModal === "edicao"
            ? `${API}/livros/${livroEditando}`
            : `${API}/livros`,
          {
            method: tipoModal === "edicao" ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dadosLivro)
          }
        );
      }

      if (resposta.status === 401) {
        sair();
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      if (resposta.status === 403) {
        throw new Error("Você não tem permissão para realizar esta ação.");
      }

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
          dados?.mensagem || "Não foi possível salvar as informações."
        );
      }

      setModalAberto(false);
      setFormulario(formularioInicial);
      setLivroEditando(null);
      setQuantidadeEstoque("");

      await carregarLivros();
    } catch (error) {
      console.error("Erro ao salvar:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as informações."
      );
    } finally {
      setSalvando(false);
    }
  };

  // Excluir livro
  const excluirLivro = async (livro: Livro) => {
    if (!ehAdministrador) return;

    const confirmou = window.confirm(
      `Tem certeza que deseja excluir "${livro.title}"?`
    );

    if (!confirmou) return;

    try {
      setErro("");

      const resposta = await fetch(`${API}/livros/${livro._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resposta.status === 401) {
        sair();
        return;
      }

      if (resposta.status === 403) {
        throw new Error("Apenas administradores podem excluir livros.");
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir o livro.");
      }

      await carregarLivros();
    } catch (error) {
      console.error("Erro ao excluir livro:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o livro."
      );
    }
  };

  // Abrir cadastro de funcionário
  const abrirCadastroFuncionario = () => {
    if (!ehAdministrador) return;

    setFuncionarioEditando(null);
    setFormularioFuncionario(formularioFuncionarioInicial);
    setMostrarSenhaFuncionario(false);
    setMostrarSenhaAdministrador(false);
    setErro("");
    setModalFuncionarioAberto(true);
  };

  // Abrir edição de funcionário
  const abrirEdicaoFuncionario = (funcionario: Funcionario) => {
    if (!ehAdministrador) return;

    setFuncionarioEditando(funcionario.id);

    setFormularioFuncionario({
      nome: funcionario.nome,
      identificador: funcionario.identificador,
      senha: "",
      senhaAdministrador: "",
      ativo: funcionario.ativo
    });

    setMostrarSenhaFuncionario(false);
    setMostrarSenhaAdministrador(false);
    setErro("");
    setModalFuncionarioAberto(true);
  };

  // Salvar cadastro ou edição de funcionário
  const salvarFuncionario = async (
    evento: FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (!ehAdministrador) return;

    setSalvando(true);
    setErro("");

    try {
      const nome = formularioFuncionario.nome.trim();

      const identificadorFuncionario =
        formularioFuncionario.identificador.trim();

      const senhaFuncionario = formularioFuncionario.senha;

      if (!nome || !identificadorFuncionario) {
        throw new Error("Preencha o nome e o identificador.");
      }

      let resposta: Response;

      if (funcionarioEditando) {
        const dadosFuncionario: {
          nome: string;
          identificador: string;
          senha?: string;
          ativo: boolean;
        } = {
          nome,
          identificador: identificadorFuncionario,
          ativo: formularioFuncionario.ativo
        };

        if (senhaFuncionario.trim()) {
          if (senhaFuncionario.length < 8) {
            throw new Error(
              "A nova senha deve ter pelo menos 8 caracteres."
            );
          }

          dadosFuncionario.senha = senhaFuncionario;
        }

        resposta = await fetch(
          `${API}/usuarios/funcionarios/${funcionarioEditando}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dadosFuncionario)
          }
        );
      } else {
        if (!senhaFuncionario) {
          throw new Error("Informe uma senha para o funcionário.");
        }

        if (senhaFuncionario.length < 8) {
          throw new Error(
            "A senha deve ter pelo menos 8 caracteres."
          );
        }

        if (!formularioFuncionario.senhaAdministrador) {
          throw new Error(
            "Informe sua senha de administrador para autorizar."
          );
        }

        resposta = await fetch(`${API}/usuarios/funcionario`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nome,
            identificador: identificadorFuncionario,
            senha: senhaFuncionario,
            senhaAdministrador: formularioFuncionario.senhaAdministrador
          })
        });
      }

      if (resposta.status === 401) {
        sair();
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      if (resposta.status === 403) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
          dados?.mensagem ||
          "A autorização não foi aceita. Confira a senha do administrador."
        );
      }

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
          dados?.mensagem ||
          (funcionarioEditando
            ? "Não foi possível atualizar o funcionário."
            : "Não foi possível cadastrar o funcionário.")
        );
      }

      setModalFuncionarioAberto(false);
      setFuncionarioEditando(null);
      setFormularioFuncionario(formularioFuncionarioInicial);
      setMostrarSenhaFuncionario(false);
      setMostrarSenhaAdministrador(false);

      await carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o funcionário."
      );
    } finally {
      setSalvando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setLivroEditando(null);
    setFormulario(formularioInicial);
    setQuantidadeEstoque("");
    setErro("");
  };

  const fecharModalFuncionario = () => {
    setModalFuncionarioAberto(false);
    setFuncionarioEditando(null);
    setFormularioFuncionario(formularioFuncionarioInicial);
    setMostrarSenhaFuncionario(false);
    setMostrarSenhaAdministrador(false);
    setErro("");
  };

  const tituloPagina = {
    dashboard: "Painel",
    livros: "Livros",
    estoque: "Estoque",
    funcionarios: "Funcionários"
};
  // Tela de login
  if (!token || !usuario) {
    return (
      <div className="tela-login">
        <div className="login-card">
          <div className="login-logo">
            <img src="/cozy-logo.png" alt="Cozy Book Store" />
          </div>

          <div className="login-titulo">
            <span className="subtitulo">COZY BOOK STORE</span>
            <h1>Bem-vindo de volta!</h1>
            <p>Entre na sua conta para acessar a livraria.</p>
          </div>

          <form onSubmit={realizarLogin} className="formulario-login">
            <label>
              Identificador
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Senha
              <div className="campo-senha">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {erro && <p className="mensagem-erro">{erro}</p>}

            <button
              type="submit"
              className="botao-principal login-botao"
              disabled={entrando}
            >
              {entrando ? "Entrando..." : "Entrar na minha conta"}
            </button>
          </form>

          <p className="login-rodape">
            Um cantinho especial para cuidar dos seus livros.
          </p>
        </div>
      </div>
    );
  }

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
              setErro("");
            }}
          >
            <LayoutDashboard size={19} />
            <span>Painel</span>
          </a>

          <a
            href="#livros"
            className={pagina === "livros" ? "ativo" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPagina("livros");
              setBusca("");
              setErro("");
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
              setErro("");
            }}
          >
            <Package size={19} />
            <span>Estoque</span>
          </a>

          {ehAdministrador && (
            <a
              href="#funcionarios"
              className={pagina === "funcionarios" ? "ativo" : ""}
              onClick={(e) => {
                e.preventDefault();
                setPagina("funcionarios");
                setBusca("");
                setErro("");
                carregarFuncionarios();
              }}
            >
              <ShoppingBag size={19} />
              <span>Funcionários</span>
            </a>
          )}
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
            <div className="perfil-info">
              <strong>{usuario.nome}</strong>
              <span>
                {ehAdministrador ? "Administrador" : "Funcionário"}
              </span>
            </div>

            <div className="avatar">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              className="menu-btn"
              onClick={sair}
              title="Sair da conta"
              aria-label="Sair da conta"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* Conteúdo principal da página */}
        <section className="pagina">
          <div className="titulo-pagina">
  <div>
    <span className="subtitulo">
      {pagina === "dashboard"
        ? "VISÃO GERAL"
        : pagina === "funcionarios"
          ? "EQUIPE"
          : "GERENCIAMENTO"}
    </span>

    <h1>{tituloPagina[pagina]}</h1>

        <p>
          {pagina === "dashboard"
            ? "Acompanhe o desempenho da sua livraria."
            : pagina === "livros"
              ? "Consulte, cadastre e gerencie seus livros."
              : pagina === "funcionarios"
                ? "Consulte, cadastre e edite os funcionários da livraria."
                : "Acompanhe os livros que precisam de reposição."}
        </p>
      </div>

      {pagina === "funcionarios" && ehAdministrador ? (
        <button
          type="button"
          className="botao-principal"
          onClick={abrirCadastroFuncionario}
        >
          <Plus size={18} /> Adicionar funcionário
        </button>
      ) : pagina !== "funcionarios" ? (
        <button
          type="button"
          className="botao-principal"
          onClick={abrirCadastro}
        >
          <Plus size={18} /> Novo livro
        </button>
      ) : null}
    </div>
          

          {erro && <p className="mensagem-erro">{erro}</p>}

          {pagina === "dashboard" && (
            <div className="cards">
              <div className="card">
                <div className="card-icone roxo">
                  <BookOpen />
                </div>
                <span className="card-label">Total de livros</span>
                <h2 className="card-valor">
                  {carregando ? "..." : totalLivros}
                </h2>
                <small className="card-descricao">Livros cadastrados</small>
              </div>

              <div className="card">
                <div className="card-icone verde">
                  <Package />
                </div>
                <span className="card-label">Unidades em estoque</span>
                <h2 className="card-valor">
                  {carregando ? "..." : totalUnidades}
                </h2>
                <small className="card-descricao">Exemplares disponíveis</small>
              </div>

              <div className="card">
                <div className="card-icone amarelo">
                  <AlertTriangle />
                </div>
                <span className="card-label">Estoque baixo</span>
                <h2 className="card-valor">
                  {carregando ? "..." : estoqueBaixo}
                </h2>
                <small className="card-descricao">Precisam de reposição</small>
              </div>

              <div className="card">
                <div className="card-icone azul">
                  <TrendingUp />
                </div>
                <span className="card-label">Valor em estoque</span>
                <h2 className="card-valor">
                  {carregando ? "..." : formatarMoeda(valorEstoque)}
                </h2>
                <small className="card-descricao">Valor dos exemplares</small>
              </div>
            </div>
          )}

          {/* Área exclusiva de funcionários */}
          {pagina === "funcionarios" && ehAdministrador && (
            <div className="secao-livros">
              <div className="secao-header">
                <div>
                  <h2>Funcionários cadastrados</h2>
                  <p>Consulte e gerencie os usuários da sua equipe.</p>
                </div>

                <strong>
                  {funcionarios.length} funcionário(s)
                </strong>
              </div>

              <div className="busca">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar funcionário..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              {carregandoFuncionarios ? (
                <div className="estado-vazio">
                  <p>Carregando funcionários...</p>
                </div>
              ) : funcionariosFiltrados.length > 0 ? (
                <div className="lista-livros">
                  {funcionariosFiltrados.map((funcionario) => (
                    <div className="item-livro" key={funcionario.id}>
                      <div className="livro-info">
                        <strong>{funcionario.nome}</strong>
                        <span>{funcionario.identificador}</span>
                      </div>

                      <span className="livro-genero">Funcionário</span>

                      <span className="livro-estoque">
                        {funcionario.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <div className="acoes-livro">
                        <button
                          type="button"
                          onClick={() => abrirEdicaoFuncionario(funcionario)}
                          aria-label={`Editar ${funcionario.nome}`}
                          title="Editar funcionário"
                        >
                          <Pencil size={17} />
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
                      ? "Nenhum funcionário encontrado"
                      : "Nenhum funcionário cadastrado"}
                  </h3>

                  <p>
                    {busca
                      ? "Tente buscar por outro nome ou identificador."
                      : "Adicione funcionários para que eles apareçam nesta seção."}
                  </p>

                  {!busca && (
                    <button
                      type="button"
                      className="botao-principal"
                      onClick={abrirCadastroFuncionario}
                    >
                      <Plus size={18} /> Adicionar funcionário
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Área de livros: não aparece na aba Funcionários */}
          {pagina !== "funcionarios" && (
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
                        {ehAdministrador && (
                          <button
                            type="button"
                            onClick={() => abrirEdicao(livro)}
                            aria-label={`Editar ${livro.title}`}
                            title="Editar dados do livro"
                          >
                            <Pencil size={17} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => abrirAtualizacaoEstoque(livro)}
                          aria-label={`Atualizar estoque de ${livro.title}`}
                          title="Atualizar estoque"
                        >
                          <Package size={17} />
                        </button>

                        {ehAdministrador && (
                          <button
                            type="button"
                            onClick={() => excluirLivro(livro)}
                            aria-label={`Excluir ${livro.title}`}
                            title="Excluir livro"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
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
                      type="button"
                      className="botao-principal"
                      onClick={abrirCadastro}
                    >
                      <Plus size={18} /> Cadastrar primeiro livro
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modal de livros */}
      {modalAberto && (
        <div className="modal-fundo" onClick={fecharModal}>
          <div
            className="modal-livro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="subtitulo">COZY BOOK STORE</span>

                <h2>
                  {tipoModal === "estoque"
                    ? "Atualizar estoque"
                    : tipoModal === "edicao"
                      ? "Editar livro"
                      : "Novo livro"}
                </h2>

                <p>
                  {tipoModal === "estoque"
                    ? "Informe a nova quantidade disponível."
                    : "Preencha as informações do livro."}
                </p>
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
              {tipoModal === "estoque" ? (
                <div className="formulario-grid">
                  <label className="campo-completo">
                    Nova quantidade em estoque
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={quantidadeEstoque}
                      onChange={(e) => setQuantidadeEstoque(e.target.value)}
                      placeholder="Informe a quantidade"
                    />
                  </label>
                </div>
              ) : (
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

                  {tipoModal === "cadastro" && (
                    <label>
                      Quantidade em estoque
                      <input
                        required
                        type="number"
                        min="0"
                        value={formulario.estoque}
                        onChange={(e) =>
                          atualizarCampo("estoque", e.target.value)
                        }
                      />
                    </label>
                  )}

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
              )}

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
                    : tipoModal === "estoque"
                      ? "Atualizar estoque"
                      : tipoModal === "edicao"
                        ? "Salvar alterações"
                        : "Cadastrar livro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cadastro e edição de funcionário */}
      {modalFuncionarioAberto && (
        <div
          className="modal-fundo"
          onClick={fecharModalFuncionario}
        >
          <div
            className="modal-livro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="subtitulo">COZY BOOK STORE</span>

                <h2>
                  {funcionarioEditando
                    ? "Editar funcionário"
                    : "Adicionar funcionário"}
                </h2>

                <p>
                  {funcionarioEditando
                    ? "Atualize os dados de acesso do funcionário."
                    : "Preencha os dados para cadastrar um novo funcionário."}
                </p>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModalFuncionario}
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={salvarFuncionario}>
              <div className="formulario-grid">
                <label className="campo-completo">
                  Nome completo
                  <input
                    required
                    value={formularioFuncionario.nome}
                    onChange={(e) =>
                      setFormularioFuncionario((anterior) => ({
                        ...anterior,
                        nome: e.target.value
                      }))
                    }
                    placeholder="Nome do funcionário"
                  />
                </label>

                <label className="campo-completo">
                  Identificador
                  <input
                    required
                    value={formularioFuncionario.identificador}
                    onChange={(e) =>
                      setFormularioFuncionario((anterior) => ({
                        ...anterior,
                        identificador: e.target.value
                      }))
                    }
                    placeholder="Usuário de acesso"
                  />
                </label>

                <label className="campo-completo">
                  {funcionarioEditando
                    ? "Nova senha"
                    : "Senha do funcionário"}

                  <div className="campo-senha">
                    <input
                      type={mostrarSenhaFuncionario ? "text" : "password"}
                      value={formularioFuncionario.senha}
                      onChange={(e) =>
                        setFormularioFuncionario((anterior) => ({
                          ...anterior,
                          senha: e.target.value
                        }))
                      }
                      placeholder={
                        funcionarioEditando
                          ? "Deixe vazio para manter a senha atual"
                          : "Crie uma senha com pelo menos 8 caracteres"
                      }
                      autoComplete="new-password"
                      required={!funcionarioEditando}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenhaFuncionario(!mostrarSenhaFuncionario)
                      }
                      aria-label={
                        mostrarSenhaFuncionario
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                      title={
                        mostrarSenhaFuncionario
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {mostrarSenhaFuncionario
                        ? <EyeOff size={19} />
                        : <Eye size={19} />}
                    </button>
                  </div>

                  {funcionarioEditando && (
                    <small>
                      Preencha somente se desejar alterar a senha.
                    </small>
                  )}
                </label>

                {funcionarioEditando && (
                  <label className="campo-completo">
                    Situação do funcionário

                    <select
                      value={
                        formularioFuncionario.ativo ? "ativo" : "inativo"
                      }
                      onChange={(e) =>
                        setFormularioFuncionario((anterior) => ({
                          ...anterior,
                          ativo: e.target.value === "ativo"
                        }))
                      }
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </label>
                )}

                {!funcionarioEditando && (
                  <label className="campo-completo">
                    Sua senha de administrador

                    <div className="campo-senha">
                      <input
                        type={mostrarSenhaAdministrador ? "text" : "password"}
                        value={formularioFuncionario.senhaAdministrador}
                        onChange={(e) =>
                          setFormularioFuncionario((anterior) => ({
                            ...anterior,
                            senhaAdministrador: e.target.value
                          }))
                        }
                        placeholder="Digite sua senha para autorizar o cadastro"
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarSenhaAdministrador(
                            !mostrarSenhaAdministrador
                          )
                        }
                        aria-label={
                          mostrarSenhaAdministrador
                            ? "Ocultar senha do administrador"
                            : "Mostrar senha do administrador"
                        }
                        title={
                          mostrarSenhaAdministrador
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {mostrarSenhaAdministrador
                          ? <EyeOff size={19} />
                          : <Eye size={19} />}
                      </button>
                    </div>

                    <small>
                      Essa senha confirma sua autorização para criar a conta.
                    </small>
                  </label>
                )}
              </div>

              {erro && <p className="mensagem-erro">{erro}</p>}

              <div className="modal-acoes">
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={fecharModalFuncionario}
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
                    : funcionarioEditando
                      ? "Salvar alterações"
                      : "Cadastrar funcionário"}
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
