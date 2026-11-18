(function () {
  'use strict';
  window.MuseumTrails = [
    {
      id: 'leonardo',
      title: ['Leonardo’nun fikirleri', 'Leonardo’s ideas'],
      intro: ['Çizimden modele dört durak. Ahşap, dişli ve tekerleklerin farklı fikirlerde nasıl bir araya geldiğine bak.',
        'Four stops from drawing to model. See how wood, gears and wheels come together in different ideas.'],
      models: ['scythed', 'giantbow', 'organ33', 'leonardo'],
      connections: [
        ['Önce tekerlek ile hareketli kolların birlikte düşünüldüğü bir arabaya bakalım.', 'Start with a carriage that links wheels and moving arms.'],
        ['Bir sonraki çizimde ölçek büyüyor. Taşıyıcı tekerlekler bu kez dev bir yayı destekliyor.', 'The next drawing changes scale. Wheels now support a giant bow.'],
        ['Tek büyük yaydan, sıralara ayrılan çok sayıda parçaya geçiyoruz.', 'From one large bow, move to repeated parts arranged in rows.'],
        ['Son durakta taşıma ve mekanizma, konik bir kabuk içinde buluşuyor.', 'At the final stop, transport and mechanism meet beneath a conical shell.']
      ]
    },
    {
      id: 'submarines',
      title: ['Denizaltının doğuşu', 'The emergence of submarines'],
      intro: ['İnsan gücünden buhara ve dizel-elektrik tahrike. Dört sergi üzerinden suyun altına inmenin zorluklarını keşfet.',
        'From human power to steam and diesel-electric propulsion. Explore the challenges of going underwater in four exhibits.'],
      models: ['turtle', 'abdulhamid', 'u505', 'fa330'],
      connections: [
        ['Dar ahşap kabukta tek kişinin hareket ettirdiği mekanizmalarla başla.', 'Start with mechanisms operated by one person inside a cramped wooden shell.'],
        ['İnsan gücünden buhar makinesine geçiyoruz. Gövde büyürken denge ve kumanda sorunları sürüyor.', 'Move from human power to steam. As the hull grows, balance and control remain challenges.'],
        ['Sonraki sergide yüzey ve dalış için iki farklı tahrik sistemi var.', 'The next exhibit uses different propulsion systems on the surface and underwater.'],
        ['Gövdenin dışına çıkıyoruz. Fa 330, denizaltının görüş yüksekliğini artırmak için geliştirilmiş ayrı bir gözcüydü.', 'Step outside the hull. The Fa 330 was a separate aerial lookout developed to extend a submarine’s view.']
      ]
    },
    {
      id: 'aviation',
      title: ['Pervaneden jet motoruna', 'From propeller to jet'],
      intro: ['Dört sergide havacılık. Pervane, erken turbojet ve yönlendirilebilir itiş arasındaki farklara bak.',
        'Four aviation exhibits. Explore propellers, early turbojets and vectored thrust.'],
      models: ['spitfire', 'jumo004', 'j79', 'harrier'],
      connections: [
        ['Piston motorunun döndürdüğü pervaneyle başla.', 'Start with a propeller driven by a piston engine.'],
        ['Me 262’nin kanat altındaki motorları, erken seri üretim turbojetlere geçişi gösteriyor.', 'The Me 262’s underwing engines illustrate the transition to early production turbojets.'],
        ['Soğuk Savaş döneminde kompresör, türbin ve egzoz bölümleri yeni hız hedeflerine göre gelişti.', 'In the Cold War, compressors, turbines and exhaust systems developed around new speed goals.'],
        ['Son sergide değişen yalnız hız değil. Pegasus’un döner nozulları itişin yönünü de değiştiriyor.', 'At the final stop, speed is only part of the story. The Pegasus nozzles change the direction of thrust.']
      ]
    }
  ];
})();
