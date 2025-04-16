import { useEffect, useState } from 'react';

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
  'Estado da Bateria'
];

export default function Catalog({ categoria }) {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    fetch(urls[categoria])
      .then(res => res.json())
      .then((dados) => {
        setProdutos(dados);
        setFiltros({});
        setPagina(1);
      });
  }, [categoria]);

  const handleFiltro = (filtro, valor) => {
    setPagina(1);
    setFiltros(prev => {
      const atual = prev[filtro] || [];
      if (atual.includes(valor)) {
        return { ...prev, [filtro]: atual.filter(v => v !== valor) };
      } else {
        return { ...prev, [filtro]: [...atual, valor] };
      }
    });
  };

  const aplicarFiltros = (lista) => {
    return lista.filter(item =>
      Object.entries(filtros).every(([filtro, valores]) =>
        valores.length === 0 || valores.includes(item[filtro])
      )
    );
  };

  const dadosFiltrados = aplicarFiltros(produtos);
  const totalPaginas = Math.ceil(dadosFiltrados.length / 16);
  const itensPagina = dadosFiltrados.slice((pagina - 1) * 16, pagina * 16);

  const valoresUnicos = (chave) => {
    const todos = produtos.map(p => p[chave]).filter(Boolean);
    return [...new Set(todos)];
  };

  
return (
    <>
      <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
        <p>Os dados atualizam automaticamente a cada 10 minutos.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
        >
          🔄 Recarregar página
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-1/4 space-y-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {filtrosDisponiveis.map(filtro => (
          <div key={filtro}>
            <h3 className="text-sm font-bold mb-1">{filtro}</h3>
            <div className="space-y-1">
              {valoresUnicos(filtro).map((valor, idx) => (
                <label key={idx} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
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

      <main className="md:w-3/4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {itensPagina.map((item, index) => {
            const avaria = item['Avarias de Funcionalidade']?.trim() || 'Sem avarias';
            const touch = item['Touch Screen']?.trim() || 'Não';

            return (
              <div key={index} className="bg-white p-4 rounded-2xl shadow">
                <img src={item['Link Imagem']} alt={item.Modelo}
                  className="w-full h-40 object-contain bg-gray-50 rounded mb-2 border border-black" />
                <h2 className="text-base font-semibold mb-1">{item.Fabricante} {item.Modelo}</h2>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">SKU: {item.SKU}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Qtd: {item['Quantidade em CB']} unid.</span>
                </div>
                <p className="text-sm text-gray-600">{item['Processador Modelo'] || item['Processador']}</p>
                <p className="text-sm">{item.Memória} RAM / {item.Armazenamento}</p>

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
                  <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
                    <span><strong>Resolução:</strong> {item['Resolução']}</span>
                  </div>
                </div>

                <p className="mt-2 text-black font-bold text-lg">
                  {item[' Valor PIX ']} <span className="text-sm font-normal">à vista, via PIX</span>
                </p>
                <p className="text-green-600 font-semibold text-sm">
                  {item[' Valor Cartão 10x ']} <span className="font-normal">em até 10x no cartão de crédito</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPagina(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagina === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


      <footer className="text-xs text-center text-gray-400 mt-10">
        As imagens são meramente ilustrativas e foram obtidas automaticamente por pesquisa no Google.
      </footer>
    </>
  );
}
