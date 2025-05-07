
import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';

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
  'Tem Placa de Vídeo'
];

export default function Catalog({ categoria }) {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [pagina, setPagina] = useState(1);
  const [ordenacao, setOrdenacao] = useState('');
  const [buscaSKU, setBuscaSKU] = useState('');
  const [resultadoSKU, setResultadoSKU] = useState(null);

  const todasAbas = Object.values(urls);

  useEffect(() => {
    fetch(urls[categoria])
      .then((res) => res.json())
      .then((dados) => {
        const normalizados = dados.map((item) => ({
          'Tem Placa de Vídeo': (item['Placa de Vídeo Modelo'] && item['Placa de Vídeo Modelo'].trim() !== '' && !item['Placa de Vídeo Modelo'].toLowerCase().includes('dedicada')) ? 'Sim' : 'Não',
          ...item,
          Memória: item.Memória?.trim() || item.Memória,
        }));
        setProdutos(normalizados);
        setFiltros({});
        setPagina(1);
        setOrdenacao('');
      });
  }, [categoria]);

  const handleBuscaSKU = async () => {
    if (!buscaSKU.trim()) {
      setResultadoSKU(null);
      return;
    }

    for (const url of todasAbas) {
      const res = await fetch(url);
      const dados = await res.json();
      const encontrado = dados.find((item) => item.SKU?.trim() === buscaSKU.trim());
      if (encontrado) {
        setResultadoSKU(encontrado);
        return;
      }
    }

    setResultadoSKU(null);
  };

  const handleFiltro = (filtro, valor) => {
    setPagina(1);
    setFiltros((prev) => {
      const atual = prev[filtro] || [];
      if (atual.includes(valor)) {
        return { ...prev, [filtro]: atual.filter((v) => v !== valor) };
      } else {
        return { ...prev, [filtro]: [...atual, valor] };
      }
    });
  };

  const aplicarFiltros = (lista) => {
    let filtrada = lista.filter((item) =>
      Object.entries(filtros).every(([filtro, valores]) =>
        valores.length === 0 || valores.includes(item[filtro])
      )
    );

    if (ordenacao === 'precoMenor') {
      filtrada.sort((a, b) =>
        parseFloat(a[' Valor PIX '].replace(/[R$\s.]/g, '').replace(',', '.')) -
        parseFloat(b[' Valor PIX '].replace(/[R$\s.]/g, '').replace(',', '.'))
      );
    } else if (ordenacao === 'precoMaior') {
      filtrada.sort((a, b) =>
        parseFloat(b[' Valor PIX '].replace(/[R$\s.]/g, '').replace(',', '.')) -
        parseFloat(a[' Valor PIX '].replace(/[R$\s.]/g, '').replace(',', '.'))
      );
    }

    return filtrada;
  };

  const dadosFiltrados = aplicarFiltros(produtos);
  const totalPaginas = Math.ceil(dadosFiltrados.length / 16);
  const itensPagina = dadosFiltrados.slice((pagina - 1) * 16, pagina * 16);

  const valoresUnicos = (chave) => {
    const todos = produtos.map((p) => p[chave]).filter(Boolean);
    return [...new Set(todos)];
  };

  const copiarSKU = (sku) => {
    navigator.clipboard.writeText(sku);
    alert(`SKU ${sku} copiado!`);
  };

  return (
<>
  <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
    <img
      src="https://i.imgur.com/ptWo1jP.png"
      alt="Banner Catálogo"
      className="w-full h-auto object-cover"
    />
  </div>

    <>
      <div className="w-full px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white">
        <img src="/logo.png" alt="Logo LevelMicro" className="h-32 mb-2 sm:mb-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            value={buscaSKU}
            onChange={(e) => setBuscaSKU(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBuscaSKU();
            }}
            placeholder="Buscar por SKU"
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

      <div className="flex flex-col md:flex-row gap-6 px-4 mt-4">
        {!resultadoSKU && (
          <aside className="w-full md:w-1/5 lg:w-[15%] space-y-4">
            <div className="flex items-center justify-between">
  <h2 className="text-lg font-semibold text-gray-700">Filtros</h2>
  {Object.values(filtros).some((val) => val?.length > 0) && (
    <button
      onClick={() => {
        setFiltros({});
        setPagina(1);
      }}
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
        )}

        <main className="w-full md:w-4/5 lg:w-[85%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(resultadoSKU ? [resultadoSKU] : itensPagina).map((item, index) => {
              const avaria = item['Avarias de Funcionalidade']?.trim() || 'Sem avarias';
              const touch = item['Touch Screen']?.trim() || 'Não';

              return (
                <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-200 hover:shadow-md transition">
                  <img
                    src={item['Link Imagem']}
                    alt={item.Modelo}
                    className="w-full h-40 object-contain bg-gray-50 rounded mb-2"
                  />
                  <h2 className="text-base font-semibold text-gray-800 mb-1">
                    {item.Fabricante} {item.Modelo}
                  </h2>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      SKU: {item.SKU}
                      <button
                        onClick={() => copiarSKU(item.SKU)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        📋
                      </button>
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Qtd: {item['Quantidade em CB']} unid.
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {item['Processador Modelo'] || item['Processador']}
                  </p>
                  <p className="text-sm text-gray-700">{item.Memória} RAM / {item.Armazenamento}</p>

                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-700 mt-2">
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Chassi:</strong> {item['Classificação de Chassi']}</span>
                      <span><strong>Tela:</strong> {item['Classificação de Tela']}</span>
                    </div>
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Bateria:</strong> {item['Estado da Bateria']}</span>
                      <span><strong>Touch:</strong> {touch}</span>
                    </div>
                    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                      <span><strong>Avaria:</strong> {avaria}</span>
                      <span><strong>Idioma:</strong> {item['Linguagem']}</span>
                    </div>
                    <div className="border rounded px-2 py-1 bg-gray-50">
                      <strong>Placa de Vídeo:</strong> {item['Placa de Vídeo Modelo'] || 'Não'}
                    </div>
                    <div className="border rounded px-2 py-1 bg-gray-50">
                      <strong>Resolução:</strong> {item['Resolução']}
                    </div>
                  </div>

                  <p className="mt-2 text-black font-bold text-lg">
                    {item[' Valor PIX ']} <span className="text-sm font-normal">à vista via PIX</span>
                  </p>
                  <p className="text-green-600 font-semibold text-sm">
                    {item[' Valor Cartão 10x ']} <span className="font-normal">em até 10x no cartão</span>
                  </p>
                </div>
              );
            })}
          </div>

          {!resultadoSKU && totalPaginas > 1 && (
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
  </>
  );
}
