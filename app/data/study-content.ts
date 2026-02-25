export type TopicId =
  | "ek-fiil"
  | "zarflar"
  | "fiilde-yapi"
  | "soz-sanatlari"
  | "cumlede-anlam";

export type Skill = "recognition" | "production";

export type Difficulty = 1 | 2 | 3;

export type Question = {
  id: string;
  topicId: TopicId;
  skill: Skill;
  difficulty: Difficulty;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  rule: string;
  trap: string;
  memoryHook: string;
};

export type Flashcard = {
  id: string;
  topicId: TopicId;
  skill: Skill;
  difficulty: Difficulty;
  front: string;
  back: string;
};

export const topicLabels: Record<TopicId, string> = {
  "ek-fiil": "Ek Fiil",
  zarflar: "Zarflar",
  "fiilde-yapi": "Fiilde Yapı",
  "soz-sanatlari": "Söz Sanatları",
  "cumlede-anlam": "Cümlede Anlam",
};

export const questions: Question[] = [
  {
    id: "q-ek-fiil-1",
    topicId: "ek-fiil",
    skill: "recognition",
    difficulty: 2,
    prompt:
      "Aşağıdaki cümlelerin hangisinde ek fiil, isim soylu bir sözcüğü yüklem yapmıştır?",
    choices: [
      "Dün erkenden uyudu.",
      "Yarın sinemaya gidecekmiş.",
      "Sınıfın en çalışkan öğrencisi oydu.",
      "Soruları hızlıca çözdü.",
    ],
    correctIndex: 2,
    explanation:
      "'Oydu' sözcüğü zamir kökenlidir ve ek fiil ile yüklem olmuştur.",
    rule: "Ek fiil, isim soylu sözcüklere gelerek yüklem yapabilir.",
    trap: "Çekimli fiilleri ek fiille oluşan yüklemle karıştırmak.",
    memoryHook: "Fiil yoksa, yüklem yapan ek fiili ara.",
  },
  {
    id: "q-zarf-1",
    topicId: "zarflar",
    skill: "recognition",
    difficulty: 1,
    prompt: "Hangi cümlede durum zarfı vardır?",
    choices: [
      "Yaz tatilinde köye gideceğiz.",
      "Öğretmenini dikkatlice dinliyordu.",
      "İçeri girip kapıyı kapattı.",
      "Dün çok yemek yemişim.",
    ],
    correctIndex: 1,
    explanation: "'Dikkatlice' sözcüğü fiilin nasıl yapıldığını belirtir.",
    rule: "Durum zarfı fiile 'Nasıl?' sorusunun cevabını verir.",
    trap: "Zaman zarfı ile durum zarfını karıştırmak.",
    memoryHook: "Nasıl yaptı? Cevap durum zarfıdır.",
  },
  {
    id: "q-fiilde-yapi-1",
    topicId: "fiilde-yapi",
    skill: "recognition",
    difficulty: 2,
    prompt: "Aşağıdaki fiillerden hangisi yapısına göre birleşik fiildir?",
    choices: ["Temizledi", "Çiçek açtı", "Çözüverdi", "Okumuş"],
    correctIndex: 2,
    explanation: "'Çözüverdi', tezlik yardımcı fiiliyle kurulan birleşik fiildir.",
    rule: "Yardımcı fiil veya kurallı birleşme varsa birleşik fiil olabilir.",
    trap: "İki kelimeli her yapıyı birleşik fiil sanmak.",
    memoryHook: "Yardımcı fiil varsa birleşik fiil ihtimali yüksektir.",
  },
  {
    id: "q-soz-sanatlari-1",
    topicId: "soz-sanatlari",
    skill: "recognition",
    difficulty: 1,
    prompt:
      "'Güneş, dağların ardından bize gülümseyerek günaydın diyordu.' cümlesinde hangi sanat vardır?",
    choices: [
      "Kişileştirme",
      "Benzetme",
      "Abartma",
      "Karşıtlık",
    ],
    correctIndex: 0,
    explanation: "İnsan özelliği insan dışı varlığa aktarılmıştır.",
    rule: "İnsan dışı varlığa insan özelliği verilmesi kişileştirmedir.",
    trap: "Canlandırma ile benzetmeyi karıştırmak.",
    memoryHook: "İnsan değil ama insan gibi davranıyorsa kişileştirme.",
  },
  {
    id: "q-cumlede-anlam-1",
    topicId: "cumlede-anlam",
    skill: "recognition",
    difficulty: 2,
    prompt: "Hangi cümlede koşul-sonuç ilişkisi vardır?",
    choices: [
      "Yağmur yağdığı için maç iptal edildi.",
      "Düzenli çalışırsan başarılı olursun.",
      "Seni görmek için geldim.",
      "Hava soğuyunca sobayı kurduk.",
    ],
    correctIndex: 1,
    explanation: "Başarı, düzenli çalışma şartına bağlanmıştır.",
    rule: "-sa/-se eki çoğunlukla koşul ilişkisi kurar.",
    trap: "Neden-sonuç cümlelerini koşul sanmak.",
    memoryHook: "Şart varsa sonuç vardır.",
  },
  {
    id: "q-cumlede-anlam-2",
    topicId: "cumlede-anlam",
    skill: "production",
    difficulty: 3,
    prompt: "Aşağıdakilerden hangisi amaç-sonuç cümlesidir?",
    choices: [
      "Erken uyuduğu için dinçti.",
      "Başarılı olmak için plan yaptı.",
      "Hava soğuk olduğundan dışarı çıkmadı.",
      "Çok çalıştı ve kazandı.",
    ],
    correctIndex: 1,
    explanation: "'...için plan yaptı' ifadesi amaç bildirir.",
    rule: "Eylemin yapılma amacı belirtiliyorsa amaç-sonuç vardır.",
    trap: "'İçin' geçen her cümleyi amaç sanmak.",
    memoryHook: "Niye yaptı? Geleceğe dönük hedef varsa amaçtır.",
  },
];

export const flashcards: Flashcard[] = [
  {
    id: "f-ek-fiil",
    topicId: "ek-fiil",
    skill: "production",
    difficulty: 2,
    front: "Ek fiilin iki temel görevi nedir?",
    back: "1) İsim soylu sözcükleri yüklem yapar. 2) Basit zamanlı fiilleri birleşik zamanlı yapar.",
  },
  {
    id: "f-zarflar",
    topicId: "zarflar",
    skill: "recognition",
    difficulty: 1,
    front: "Durum zarfını nasıl bulursun?",
    back: "Fiile 'Nasıl?' sorusunu sor. Verilen cevap durum zarfıdır.",
  },
  {
    id: "f-fiilde-yapi",
    topicId: "fiilde-yapi",
    skill: "recognition",
    difficulty: 2,
    front: "Birleşik fiilin kısa tanımı nedir?",
    back: "En az iki unsurun birleşmesiyle oluşan fiil yapısıdır (yardım etti, çözüverdi vb.).",
  },
];
