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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>Os dados atualizam automaticamente a cada 10 minutos.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
        >
          🔄 Recarregar página
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-1/5 lg:w-[15%] space-y-4">
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

      <main className="w-full md:w-4/5 lg:w-[85%]">
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
                  <span className="bg-gray-100 px-2 py-1 rounded flex items-center space-x-1">
    <span>SKU: {item.SKU}</span>
    <button
      onClick={() => navigator.clipboard.writeText(item.SKU)}
      title="Copiar SKU"
      className="text-blue-600 hover:text-blue-800"
    >
      📋
    </button>
  </span>
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

      <footer className="text-xs text-center text-gray-400 mt-10">
        As imagens são meramente ilustrativas e foram obtidas automaticamente por pesquisa no Google.
      </footer>

      {/* Botão flutuante para baixar Excel */}
      <a
        href="https://docs.google.com/spreadsheets/d/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/export?format=xlsx"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-5 bg-green-700 hover:bg-green-800 text-white p-3 rounded-full shadow-lg transition"
        title="Baixar catálogo em Excel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19 2H8a2 2 0 00-2 2v2H5a2 2 0 00-2 2v12a2 2 0 002 2h11a2 2 0 002-2v-2h1a2 2 0 002-2V4a2 2 0 00-2-2zM5 8h1v10H5V8zm13 10a1 1 0 01-1 1H8a1 1 0 01-1-1V4h11v14zm3-4a1 1 0 01-1 1h-1V8h1a1 1 0 011 1v5z"/>
          <path d="M10.293 12l1.853 1.854a.5.5 0 01-.707.707L9.586 12l1.853-1.854a.5.5 0 11.707.707L10.293 12z"/>
        </svg>
      </a>

      {/* Botão flutuante do WhatsApp */}
      <a
        href="https://wa.me/5511994448143"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition"
        title="Fale conosco pelo WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.548 4.084 1.507 5.812L0 24l6.352-1.671A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm-.004 22.002c-1.888 0-3.718-.499-5.317-1.44l-.38-.226-3.769.992.999-3.67-.246-.377a9.926 9.926 0 01-1.539-5.305c0-5.514 4.486-10 10-10 2.674 0 5.187 1.04 7.071 2.929A9.942 9.942 0 0122 12c0 5.514-4.486 10-10.004 10.002zm5.558-7.627c-.305-.152-1.803-.891-2.083-.992-.28-.102-.484-.152-.688.152-.203.305-.789.992-.968 1.195-.178.203-.356.229-.66.076-.305-.152-1.288-.475-2.455-1.515-.906-.808-1.52-1.808-1.697-2.113-.178-.305-.019-.469.134-.621.137-.136.305-.356.458-.533.153-.178.203-.305.305-.508.102-.203.051-.381-.025-.533-.076-.152-.688-1.661-.942-2.276-.248-.595-.5-.515-.688-.524l-.584-.01c-.203 0-.534.076-.813.38-.28.305-1.066 1.04-1.066 2.535s1.092 2.944 1.244 3.147c.152.203 2.151 3.286 5.215 4.605.729.315 1.296.504 1.739.645.731.233 1.396.2 1.923.122.587-.087 1.803-.736 2.058-1.448.254-.711.254-1.322.178-1.448-.076-.127-.28-.203-.585-.356z"/>
        </svg>
      </a>
    </div>
  );

}
