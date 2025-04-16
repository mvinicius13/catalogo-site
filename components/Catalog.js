
import { useEffect, useState } from 'react';

const urls = {
  i5: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i5',
  i7: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Note i7',
  mac: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Macbook',
  desktop: 'https://opensheet.elk.sh/1FQRXOr27B1N7PK7NhqQmPi1kaqQqImA-iZYjRecqIw0/Desktops',
};

export default function Catalog({ categoria }) {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(urls[categoria])
      .then(res => res.json())
      .then(setProdutos);
  }, [categoria]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {produtos.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
          <img
            src={item['Link Imagem']}
            alt={item.Modelo}
            className="w-full h-40 object-contain bg-gray-50 rounded mb-2"
          />
          <h2 className="text-base font-semibold">{item.Fabricante} {item.Modelo}</h2>
          <p className="text-sm text-gray-600">{item['Processador Modelo'] || item['Processador']}</p>
          <p className="text-sm">{item.Memória} / {item.Armazenamento}</p>
          <p className="mt-2 text-green-600 font-semibold">R$ {item[' Valor PIX ']}</p>
          <p className="text-blue-600 font-semibold">R$ {item[' Valor Cartão 10x ']}</p>
        </div>
      ))}
    </div>
  );
}
