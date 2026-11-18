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
    },
    {
      id: 'cinema',
      title: ['Beyaz perdeden müzeye', 'From Screen to Museum'],
      intro: ['Beş durakta sinemayla tanınan tarihsel nesneler. Film aksesuarı, müze örneği ve yorumlanan ayrıntıların nasıl ayrıldığını keşfet.',
        'Five historical objects recognised through cinema. Explore the distinctions between screen props, museum specimens and interpreted details.'],
      models: ['c96', 'garand', 'win1887', 'ppk', 'model29'],
      connections: [
        ['C96 ile başla: tarihsel tabancanın silueti, Han Solo’nun kurmaca DL-44 aksesuarına temel oldu. Sergideki 9 mm müze örneğini filmde kullanılan nesneyle karıştırmadan incele.',
          'Start with the C96: a historical pistol silhouette became the basis of Han Solo’s fictional DL-44 prop. Inspect the 9 mm museum interpretation as a separate object from the screen prop.'],
        ['Kurmaca tasarımdan savaş filmine geçiyoruz. Er Ryan’ı Kurtarmak bağlantısıyla M1’in ceviz gövdesini ve ayrı klips sergisini keşfet; duyulan kısa tını temsili olarak üretilir.',
          'Move from a fictional design to a war film. Explore the M1’s walnut body and separate clip display through its Saving Private Ryan connection; the short tone is illustrative.'],
        ['Bu kez sinema nesnenin dış biçimini değiştiriyor. Terminator 2 sergisinde kısa ahşap kabzayı ve geniş halkayı bul; model adı 1887, kaynak üretimi 1888, film ise 1991.',
          'Cinema now changes the object’s exterior. Find the short wooden grip and wide loop in the Terminator 2 exhibit: 1887 is the model name, 1888 the source object’s production year, and 1991 the film year.'],
        ['Büyük bir halkadan kompakt bir siluete geç. Bond’un PPK bağlantısında kahverengi kabzayı incele; karşılaştırma ölçüsünün ve görsel referansın farklı müze örneklerinden geldiğine dikkat et.',
          'Move from a large loop to a compact silhouette. Examine the brown grip through the PPK’s Bond connection; note that the comparison dimension and visual reference come from different museum specimens.'],
        ['Rotayı Kirli Harry ile bitir. Model 29’un boş tamburunu ve ahşap kabzadaki yazısız levhayı incele; John Milius’a sunulan müze nesnesinin sonradan eklenen ayrıntılarını filmdeki görünümden ayır.',
          'Finish with Dirty Harry. Inspect the Model 29’s empty cylinder and unlettered grip plaque; distinguish later details on the museum object presented to John Milius from its screen appearance.']
      ]
    }
  ];
})();
