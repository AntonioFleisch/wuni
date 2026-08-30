const COURSES = [
  {
    id: "fgv-adm",
    curso: "Administração",
    instituicao: "FGV EAESP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino"],
    ingresso: ["vestibular_proprio"],
    notaCorte: 850,
    mensalidade: 9800,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 4,
    salarioMedioEgressos: 9500,
    situacaoMEC: "regular"
  },
  {
    id: "insper-adm",
    curso: "Administração",
    instituicao: "Insper",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino", "integral"],
    ingresso: ["vestibular_proprio"],
    notaCorte: 800,
    mensalidade: 9200,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 6,
    salarioMedioEgressos: 8800,
    situacaoMEC: "regular"
  },
  {
    id: "mackenzie-adm",
    curso: "Administração",
    instituicao: "Mackenzie",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino", "noturno"],
    ingresso: ["sisu", "enem_direto", "vestibular_proprio"],
    notaCorte: 650,
    mensalidade: 2400,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 4,
    taxaEvasao: 12,
    salarioMedioEgressos: 5200,
    situacaoMEC: "regular"
  },
  {
    id: "usp-fea-adm",
    curso: "Administração",
    instituicao: "USP - FEA",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino", "noturno"],
    ingresso: ["sisu"],
    notaCorte: 780,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 5,
    salarioMedioEgressos: 8000,
    situacaoMEC: "regular"
  },
  {
    id: "pucsp-adm",
    curso: "Administração",
    instituicao: "PUC-SP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["noturno"],
    ingresso: ["vestibular_proprio", "sisu"],
    notaCorte: 620,
    mensalidade: 1900,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 4,
    taxaEvasao: 15,
    salarioMedioEgressos: 4800,
    situacaoMEC: "regular"
  },
  {
    id: "unip-adm",
    curso: "Administração",
    instituicao: "UNIP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "hibrido",
    duracaoSemestres: 8,
    turnos: ["noturno"],
    ingresso: ["historico", "sisu"],
    notaCorte: 500,
    mensalidade: 700,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 3,
    taxaEvasao: 22,
    salarioMedioEgressos: 3200,
    situacaoMEC: "regular"
  },
  {
    id: "ufrj-adm",
    curso: "Administração",
    instituicao: "UFRJ",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino", "vespertino"],
    ingresso: ["sisu"],
    notaCorte: 700,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "medio",
    notaMEC: 4,
    taxaEvasao: 10,
    salarioMedioEgressos: 6200,
    situacaoMEC: "regular"
  },
  {
    id: "ufmg-adm",
    curso: "Administração",
    instituicao: "UFMG",
    cidade: "Belo Horizonte",
    estado: "MG",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino"],
    ingresso: ["sisu"],
    notaCorte: 690,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "medio",
    notaMEC: 4,
    taxaEvasao: 9,
    salarioMedioEgressos: 6000,
    situacaoMEC: "regular"
  },
  {
    id: "ufsc-adm",
    curso: "Administração",
    instituicao: "UFSC",
    cidade: "Florianópolis",
    estado: "SC",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["vespertino", "noturno"],
    ingresso: ["sisu"],
    notaCorte: 660,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "medio",
    notaMEC: 4,
    taxaEvasao: 8,
    salarioMedioEgressos: 5800,
    situacaoMEC: "regular"
  },
  {
    id: "faap-adm",
    curso: "Administração",
    instituicao: "FAAP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["matutino", "noturno"],
    ingresso: ["vestibular_proprio"],
    notaCorte: 700,
    mensalidade: 3600,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 4,
    taxaEvasao: 11,
    salarioMedioEgressos: 6500,
    situacaoMEC: "regular"
  },
  {
    id: "estacio-adm",
    curso: "Administração",
    instituicao: "Estácio",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "EAD",
    duracaoSemestres: 8,
    turnos: ["EAD"],
    ingresso: ["historico"],
    notaCorte: 450,
    mensalidade: 400,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 3,
    taxaEvasao: 28,
    salarioMedioEgressos: 2800,
    situacaoMEC: "regular"
  },
  {
    id: "usp-poli-prod",
    curso: "Engenharia de Produção",
    instituicao: "USP - Poli",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 10,
    turnos: ["integral"],
    ingresso: ["sisu"],
    notaCorte: 830,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 7,
    salarioMedioEgressos: 9200,
    situacaoMEC: "regular"
  },
  {
    id: "usp-direito",
    curso: "Direito",
    instituicao: "USP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 10,
    turnos: ["matutino"],
    ingresso: ["sisu"],
    notaCorte: 850,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 3,
    salarioMedioEgressos: 8500,
    situacaoMEC: "regular"
  },
  {
    id: "unicamp-cc",
    curso: "Ciência da Computação",
    instituicao: "Unicamp",
    cidade: "Campinas",
    estado: "SP",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["integral"],
    ingresso: ["sisu"],
    notaCorte: 800,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "medio",
    notaMEC: 5,
    taxaEvasao: 15,
    salarioMedioEgressos: 8800,
    situacaoMEC: "regular"
  },
  {
    id: "usp-medicina",
    curso: "Medicina",
    instituicao: "USP",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "publica",
    modalidade: "presencial",
    duracaoSemestres: 12,
    turnos: ["integral"],
    ingresso: ["sisu"],
    notaCorte: 920,
    mensalidade: 0,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 5,
    taxaEvasao: 1,
    salarioMedioEgressos: 15000,
    situacaoMEC: "regular"
  },
  {
    id: "belasartes-design",
    curso: "Design",
    instituicao: "Belas Artes",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "privada",
    modalidade: "presencial",
    duracaoSemestres: 8,
    turnos: ["noturno"],
    ingresso: ["vestibular_proprio"],
    notaCorte: 550,
    mensalidade: 1800,
    bolsas: true,
    custoVidaCidade: "alto",
    notaMEC: 4,
    taxaEvasao: 18,
    salarioMedioEgressos: 3800,
    situacaoMEC: "regular"
  }
];

const INGRESSO_LABELS = {
  sisu: "SiSU",
  vestibular_proprio: "Vestibular próprio",
  enem_direto: "ENEM (nota direta)",
  historico: "Histórico escolar/seriado"
};

const TURNO_LABELS = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  noturno: "Noturno",
  integral: "Integral",
  EAD: "EAD"
};

const CUSTO_VIDA_LABELS = {
  baixo: "Custo de vida baixo",
  medio: "Custo de vida médio",
  alto: "Custo de vida alto"
};

const CIDADES_DISPONIVEIS = ["São Paulo", "Campinas", "Rio de Janeiro", "Belo Horizonte", "Florianópolis"];

const CURSOS_DISPONIVEIS = [...new Set(COURSES.map((c) => c.curso))];

const AREA_INFO = {
  exatas: {
    label: "Exatas & Tecnologia",
    cursos: ["Ciência da Computação", "Engenharia de Produção", "Engenharia Civil", "Sistemas de Informação", "Matemática"]
  },
  negocios: {
    label: "Negócios & Gestão",
    cursos: ["Administração", "Economia", "Ciências Contábeis", "Marketing", "Comércio Exterior"]
  },
  humanas: {
    label: "Humanas & Direito",
    cursos: ["Direito", "Relações Internacionais", "Pedagogia", "História", "Letras"]
  },
  saude: {
    label: "Saúde & Biológicas",
    cursos: ["Medicina", "Enfermagem", "Farmácia", "Biomedicina", "Fisioterapia"]
  },
  artes: {
    label: "Artes & Comunicação",
    cursos: ["Design", "Publicidade e Propaganda", "Jornalismo", "Arquitetura e Urbanismo", "Cinema"]
  }
};

const QUIZ_QUESTIONS = [
  {
    text: "Num trabalho em grupo, você prefere...",
    options: [
      { text: "Organizar os números e o orçamento do projeto", area: "negocios" },
      { text: "Resolver o problema técnico mais complicado", area: "exatas" },
      { text: "Cuidar para que todos se sintam ouvidos", area: "humanas" },
      { text: "Pensar em como apresentar a ideia de forma criativa", area: "artes" },
      { text: "Entender o impacto do projeto nas pessoas envolvidas", area: "saude" }
    ]
  },
  {
    text: "Qual matéria você mais gosta de estudar?",
    options: [
      { text: "Matemática ou Física", area: "exatas" },
      { text: "Biologia", area: "saude" },
      { text: "História ou Sociologia", area: "humanas" },
      { text: "Artes ou Literatura", area: "artes" },
      { text: "Nenhuma em especial, mas gosto de entender como empresas funcionam", area: "negocios" }
    ]
  },
  {
    text: "No tempo livre, você prefere...",
    options: [
      { text: "Programar, montar ou consertar algo", area: "exatas" },
      { text: "Ler sobre política, sociedade ou direito", area: "humanas" },
      { text: "Desenhar, fotografar ou criar conteúdo", area: "artes" },
      { text: "Acompanhar notícias de economia e negócios", area: "negocios" },
      { text: "Cuidar de alguém ou pesquisar sobre saúde e bem-estar", area: "saude" }
    ]
  },
  {
    text: "Qual frase mais combina com você?",
    options: [
      { text: "Gosto de resolver problemas lógicos", area: "exatas" },
      { text: "Gosto de ajudar e cuidar das pessoas", area: "saude" },
      { text: "Gosto de argumentar e defender ideias", area: "humanas" },
      { text: "Gosto de criar coisas visualmente bonitas", area: "artes" },
      { text: "Gosto de planejar e liderar projetos", area: "negocios" }
    ]
  },
  {
    text: "Se pudesse ajudar a resolver um problema do mundo, qual escolheria?",
    options: [
      { text: "Criar uma tecnologia que facilite a vida das pessoas", area: "exatas" },
      { text: "Melhorar o acesso à saúde pública", area: "saude" },
      { text: "Reduzir a desigualdade social", area: "humanas" },
      { text: "Tornar a comunicação mais criativa e acessível", area: "artes" },
      { text: "Ajudar empresas a crescerem de forma sustentável", area: "negocios" }
    ]
  },
  {
    text: "Qual ambiente de trabalho parece mais com você?",
    options: [
      { text: "Um laboratório ou escritório de tecnologia", area: "exatas" },
      { text: "Um hospital ou clínica", area: "saude" },
      { text: "Um tribunal, ONG ou escola", area: "humanas" },
      { text: "Um estúdio criativo ou agência", area: "artes" },
      { text: "Uma empresa, banco ou consultoria", area: "negocios" }
    ]
  },
  {
    text: "Como você prefere aprender algo novo?",
    options: [
      { text: "Testando e praticando na prática", area: "exatas" },
      { text: "Debatendo e discutindo com outras pessoas", area: "humanas" },
      { text: "Observando exemplos visuais e criativos", area: "artes" },
      { text: "Analisando dados e números", area: "negocios" },
      { text: "Entendendo como isso ajuda outras pessoas", area: "saude" }
    ]
  },
  {
    text: "O que mais te motiva numa futura carreira?",
    options: [
      { text: "Inovar e criar soluções técnicas", area: "exatas" },
      { text: "Cuidar do bem-estar das pessoas", area: "saude" },
      { text: "Defender causas e direitos", area: "humanas" },
      { text: "Expressar criatividade", area: "artes" },
      { text: "Crescer profissionalmente e ganhar bem", area: "negocios" }
    ]
  }
];

const DEFAULT_PROFILE = {
  nome: "Aluno exemplo",
  anoEscola: "3º ano",
  escolaPublica: false,
  enem: {
    linguagens: 680,
    humanas: 700,
    natureza: 620,
    matematica: 640,
    redacao: 780
  },
  mediaHistorico: 8.2,
  rendaPerCapita: "de-3-a-5-sm",
  orcamentoMensal: 10000,
  ppi: false,
  pcd: false,
  interesses: ["Administração"],
  cidadesAceita: ["São Paulo"],
  aceitaMorarFora: true,
  turno: [],
  modalidade: ["presencial"]
};
