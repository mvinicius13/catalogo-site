import { useEffect, useState, useRef } from 'react';

const urls = {
  i5: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i5',
  i7: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i7',
  mac: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Macbook',
  desktop: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Desktops',
};

const filtrosDisponiveis = [
  'Fabricante',
  'Memória',
  'Armazenamento',
  'Processador Modelo',
  'Classificação de Chassi',
  'Classificação de Tela',
  'Estado da Bateria',
  'Tem Placa de Vídeo',
];

/**
 * Carrossel Promocional
 * - Recebe lista de imagens com { src, alt, href }
 * - Troca automática a cada 5s
 * - Setas, bolinhas, pausa no hover, swipe no mobile
 */
function PromoCarousel({ items = [], interval = 5000, className = '' }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const startX = useRef(0);
  const deltaX = useRef(0);

  const count = items.length;

  useEffect(() => {
    if (count === 0) return;
    const start = () => {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % count);
      }, interval);
    };
    start();
    return () => clearInterval(timerRef.current);
  }, [count, interval]);

  const goTo = (i) => setIndex(((i % count) + count) % count);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % count);
      }, interval);
    }
  };

  const onTouchStart = (e) => {
    pause();
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e) => {
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > 50) {
      deltaX.current < 0 ? next() : prev();
    }
    resume();
  };

  if (count === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl shadow ${className}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <div key={i} className="min-w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-black/5">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.src}
                  alt={item.alt || `Promoção ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <img
                src={item.src}
                alt={item.alt || `Promoção ${i + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Setas */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
        aria-label="Próximo"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 w-2.5 rounded-full ${index === i ? 'bg-white shadow ring-1 ring-black/10' : 'bg-white/60 hover:bg-white'}`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Catalog({ categoria }) {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [pagina, setPagina] = useState(1);
  const [ordenacao, setOrdenacao] = useState('');
  const [buscaSKU, setBuscaSKU] = useState('');
  const [buscaNome, setBuscaNome] = useState('');
  const [resultadoSKU, setResultadoSKU] = useState(null);
  const [resultadoNome, setResultadoNome] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const todasAbas = Object.values(urls);

  // === Imagens do carrossel promocional (edite livremente) ===
  const promoItems = [
    {
      src: 'https://i.imgur.com/o78JGHw.pngq=80&w=1600&auto=format&fit=crop',
      alt: 'ssd 512',
      href: 'http://wa.me/5511994448143?text=Quero%20aproveitar%20o%20upgrade%20de%20SSD%20Gr%C3%A1tis!',
    },
    {
      src: 'https://i.imgur.com/CiV83XC.pngq=80&w=1600&auto=format&fit=crop',
      alt: 'lenovo t14',
      href: 'http://wa.me/5511994448143?text=Quero%20comprar%20Lenovo%20ThinkPad%20T14!',
    },
     ];

  // --- util: normaliza campos usados em filtros e exibição ---
  const normalizar = (item) => ({
    'Tem Placa de Vídeo':
      item['Placa de Vídeo Modelo'] &&
      item['Placa de Vídeo Modelo'].trim() !== '' &&
      !String(item['Placa de Vídeo Modelo']).toLowerCase().includes('integrada')
        ? 'Sim'
        : 'Não',
    ...item,
    Memória: item.Memória?.trim() ?? item.Memória,
  });

  useEffect(() => {
    fetch(urls[categoria])
      .then((res) => res.json())
      .then((dados) => {
        const normalizados = dados.map(normalizar);
        setProdutos(normalizados);
        setFiltros({});
        setPagina(1);
        setOrdenacao('');
        setResultadoSKU(null);
        setResultadoNome([]);
      });
  }, [categoria]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (buscaSKU.trim()) {
        buscarSKU(buscaSKU.trim());
      } else {
        setResultadoSKU(null);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [buscaSKU]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (buscaNome.trim()) {
        buscarNome(buscaNome.trim());
      } else {
        setResultadoNome([]);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [buscaNome]);

  const buscarSKU = async (sku) => {
    setBuscando(true);
    for (const url of todasAbas) {
      const res = await fetch(url);
      const dados = await res.json();
      const encontrado = dados.find((item) => item.SKU?.trim() === sku);
      if (encontrado) {
        setResultadoSKU(normalizar(encontrado));
        setResultadoNome([]);
        setPagina(1);
        setBuscando(false);
        return;
      }
    }
    setResultadoSKU(null);
    setResultadoNome([]);
    setPagina(1);
    setBuscando(false);
  };

  const buscarNome = async (nome) => {
    setBuscando(true);
    let resultados = [];
    for (const url of todasAbas) {
      const res = await fetch(url);
      const dados = await res.json();
      const filtrados = dados
        .filter((item) => `${item.Fabricante} ${item.Modelo}`.toLowerCase().includes(nome.toLowerCase()))
        .map(normalizar);
      resultados = resultados.concat(filtrados);
    }
    setResultadoNome(resultados);
    setResultadoSKU(null);
    setPagina(1);
    setBuscando(false);
  };

  const handleFiltro = (filtro, valor) => {
    setPagina(1);
    setFiltros((prev) => {
      const atual = prev[filtro] || [];
      return atual.includes(valor)
        ? { ...prev, [filtro]: atual.filter((v) => v !== valor) }
        : { ...prev, [filtro]: [...atual, valor] };
    });
  };

  const aplicarFiltros = (lista) => {
    let filtrada = lista.filter((item) =>
      Object.entries(filtros).every(([filtro, valores]) =>
        (valores?.length ?? 0) === 0 || valores.includes(item[filtro])
      )
    );

    if (ordenacao === 'precoMenor') {
      filtrada.sort((a, b) =>
        parseFloat(String(a[' Valor PIX ']).replace(/[R$\s.]/g, '').replace(',', '.')) -
        parseFloat(String(b[' Valor PIX ']).replace(/[R$\s.]/g, '').replace(',', '.'))
      );
    } else if (ordenacao === 'precoMaior') {
      filtrada.sort((a, b) =>
        parseFloat(String(b[' Valor PIX ']).replace(/[R$\s.]/g, '').replace(',', '.')) -
        parseFloat(String(a[' Valor PIX ']).replace(/[R$\s.]/g, '').replace(',', '.'))
      );
    }

    return filtrada;
  };

  const valoresUnicos = (chave) => {
    const base = resultadoSKU
      ? [resultadoSKU]
      : resultadoNome.length > 0
      ? resultadoNome
      : produtos;
    const todos = base.map((p) => p[chave]).filter(Boolean);
    return [...new Set(todos)];
  };

  const copiarSKU = (sku) => {
    navigator.clipboard.writeText(sku);
    alert(`SKU ${sku} copiado!`);
  };

  const baseLista = resultadoSKU
    ? [resultadoSKU]
    : resultadoNome.length > 0
    ? resultadoNome
    : produtos;

  const listaFiltrada = aplicarFiltros(baseLista);
  const totalPaginas = Math.ceil(listaFiltrada.length / 16) || 1;
  const itensPagina = listaFiltrada.slice((pagina - 1) * 16, pagina * 16);

  return (
    <>
      {/* Banner centralizado com borda arredondada e sombra */}
      <div className="px-4 mt-4">
        <div className="max-w-[1600px] mx-auto rounded-2xl overflow-hidden shadow">
          <img
            src="https://i.imgur.com/zw9h0iN.png"
            alt="Banner Catálogo"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Carrossel promocional (mesma largura do banner) */}
      <div className="px-4 mt-4">
        <div className="max-w-[1600px] mx-auto">
          <PromoCarousel items={promoItems} />
        </div>
      </div>

      {/* Barra topo com logo e controles */}
      <div className="w-full px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white">
        <img src="/logo.png" alt="Logo LevelMicro" className="h-32 mb-2 sm:mb-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            value={buscaSKU}
            onChange={(e) => setBuscaSKU(e.target.value)}
            placeholder="Buscar por SKU"
            className="border px-3 py-2 text-sm rounded"
          />
          <input
            type="text"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            placeholder="Buscar por modelo"
            className="border px-3 py-2 text-sm rounded"
          />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Ordenar por</option>
            <option value="precoMenor">Preço: menor para maior</option>
            <option value="precoMaior">Preço: maior para menor</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            🔄 Recarregar
          </button>
        </div>
      </div>

      {/* Área principal com container largo */}
      <div className="flex flex-col md:flex-row gap-6 px-4 mt-4 max-w-[1600px] mx-auto">
        <aside className="w-full md:w-1/5 lg:w-[15%] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Filtros</h2>
            {Object.values(filtros).some((val) => val?.length > 0) && (
              <button
                onClick={() => setFiltros({})}
                className="text-sm text-black hover:underline flex items-center space-x-1"
              >
                <span className="text-lg leading-none">✖</span>
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
          {filtrosDisponiveis.map((filtro) => (
            <div key={filtro}>
              <h3 className="text-sm font-semibold mb-1">{filtro}</h3>
              <div className="space-y-1">
                {valoresUnicos(filtro).map((valor, idx) => (
                  <label key={idx} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={filtros[filtro]?.includes(valor) || false}
                      onChange={() => handleFiltro(filtro, valor)}
                    />
                    <span>{valor}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* AQUI: principal agora ocupa toda a largura disponível */}
        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {itensPagina.length > 0 ? (
              itensPagina.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-200 hover:shadow-md transition">
                  <img
                    src={item['Link Imagem']}
                    alt={item.Modelo}
                    className="w-full h-40 object-contain bg-gray-50 rounded mb-2"
                  />
                  <h2 className="text-base font-semibold text-gray-800 mb-1">{item.Fabricante} {item.Modelo}</h2>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      SKU: {item.SKU}
                      <button onClick={() => copiarSKU(item.SKU)} className="text-blue-600 hover:text-blue-800">📋</button>
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Qtd: {item['Quantidade em CB']} unid.</span>
                  </div>
                  <p className="text-sm text-gray-700">{item['Processador Modelo'] || item['Processador']}</p>
                  <p className="text-sm text-gray-700">{item.Memória} RAM / {item.Armazenamento}</p>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-700 mt-2">
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Chassi:</strong> {item['Classificação de Chassi']}</span>
                      <span><strong>Tela:</strong> {item['Classificação de Tela']}</span>
                    </div>
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Bateria:</strong> {item['Estado da Bateria']}</span>
                      <span><strong>Touch:</strong> {item['Touch Screen'] || 'Não'}</span>
                    </div>
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Avaria:</strong> {item['Avarias de Funcionalidade'] || 'Sem avarias'}</span>
                      <span><strong>Idioma:</strong> {item['Linguagem']}</span>
                    </div>
                    <div className="border rounded px-2 py-1 bg-gray-50"><strong>Placa de Vídeo:</strong> {item['Placa de Vídeo Modelo'] || 'Não'}</div>
                    <div className="border rounded px-2 py-1 bg-gray-50"><strong>Resolução:</strong> {item['Resolução']}</div>
                  </div>
                  <p className="mt-2 text-black font-bold text-lg">
                    {item[' Valor PIX ']} <span className="text-sm font-normal">no PIX com desconto</span>
                  </p>
                  <p className="text-green-600 font-semibold text-sm">
                    {item[' Valor Cartão 10x ']} <span className="font-normal">em 10x sem juros no cartão de crédito</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full mt-10">{buscando ? 'Buscando…' : 'Nenhuma correspondência com esse modelo.'}</p>
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPagina(i + 1)}
                  className={`px-3 py-1 rounded ${pagina === i + 1 ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="text-xs text-center text-gray-400 mt-10 p-4">
        As imagens são meramente ilustrativas e foram obtidas automaticamente por pesquisa no Google.
      </footer>

      <a
        href="https://docs.google.com/spreadsheets/d/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/export?format=xlsx"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-5 bg-green-700 hover:bg-green-800 text-white p-3 rounded-full shadow-lg transition"
        title="Baixar catálogo em Excel"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
          alt="Excel"
          className="w-6 h-6 object-contain"
        />
      </a>

      <a
        href="https://wa.me/5511994448143"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition"
        title="Fale conosco pelo WhatsApp"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/5968/5968841.png"
          alt="WhatsApp"
          className="w-6 h-6 object-contain"
        />
      </a>
    </>
  );
}
