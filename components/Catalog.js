import { useEffect, useState } from 'react';

const urls = {
  i5: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i5',
  i7: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i7',
  mac: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Macbook',
  desktop: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Desktops',
};

export default function Catalog({ categoria }) {
  const [produtos, setProdutos] = useState([]);

  const fetchData = () => {
    fetch(urls[categoria])
      .then(res => res.json())
      .then(setProdutos);
  };

  useEffect(() => {
    fetchData();
    const intervalo = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, [categoria]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
        <p>Os dados atualizam automaticamente a cada 10 minutos.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
        >
          🔄 Recarregar página
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {produtos.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
            <img
              src={item['Link Imagem']}
              alt={item.Modelo}
              className="w-full h-40 object-contain bg-gray-50 rounded mb-2 border border-black"
            />
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-semibold">{item.Fabricante} {item.Modelo}</h2>
              <span className="text-xs text-gray-500">SKU: {item.SKU}</span>
            </div>
            <p className="text-sm text-gray-600">{item['Processador Modelo'] || item['Processador']}</p>
            <p className="text-sm">{item.Memória} RAM / {item.Armazenamento}</p>

            <p className="mt-2 text-black font-bold text-lg">
              {item[' Valor PIX ']} <span className="text-sm font-normal">à vista, via PIX</span>
            </p>
            <p className="text-green-600 font-semibold text-sm">
              {item[' Valor Cartão 10x ']} <span className="font-normal">em até 10x no cartão de crédito</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
