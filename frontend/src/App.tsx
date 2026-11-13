
import { useState } from "react";
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

function App() {
  const [menuAberto, setMenuAberto] = useState(true);

  return (
    <div className="app">
      <aside className={`sidebar ${menuAberto ? "" : "fechada"}`}>
        <div className="logo">
          <BookOpen size={28} />
          <span>Livraria Estoque</span>
        </div>

        <nav>
          <p className="nav-titulo">MENU PRINCIPAL</p>
          <a className="ativo"><LayoutDashboard size={19} /> Dashboard</a>
          <a><BookOpen size={19} /> Livros</a>
          <a><Package size={19} /> Estoque</a>
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
          <button className="menu-btn" onClick={() => setMenuAberto(!menuAberto)}>
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

          <div className="cards">
            <div className="card">
              <div className="card-icone roxo"><BookOpen /></div>
              <span>Total de livros</span>
              <h2>0</h2>
              <small>Livros cadastrados</small>
            </div>

            <div className="card">
              <div className="card-icone verde"><Package /></div>
              <span>Unidades em estoque</span>
              <h2>0</h2>
              <small>Exemplares disponíveis</small>
            </div>

            <div className="card">
              <div className="card-icone amarelo"><AlertTriangle /></div>
              <span>Estoque baixo</span>
              <h2>0</h2>
              <small>Precisam de reposição</small>
            </div>

            <div className="card">
              <div className="card-icone azul"><TrendingUp /></div>
              <span>Valor em estoque</span>
              <h2>R$ 0,00</h2>
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
                <input placeholder="Buscar livro..." />
              </div>
            </div>

            <div className="estado-vazio">
              <div className="livro-ilustracao"><ShoppingBag size={35} /></div>
              <h3>Nenhum livro por aqui ainda</h3>
              <p>Seus livros cadastrados aparecerão nesta seção.</p>
              <button className="botao-principal">
                <Plus size={18} /> Cadastrar primeiro livro
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
