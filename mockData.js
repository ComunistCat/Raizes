const MOCK_STORAGE_KEY = "raizesNordesteData";

const defaultMockData = {
  users: [
    {
      name: "Cliente Demo",
      email: "cliente@demo.com",
      phone: "(65) 99999-0000",
      address: "Rua das Flores, 120"
    }
  ],
  loggedUserEmail: "",
  pointsByEmail: {
    "cliente@demo.com": 5
  },
  dishes: [
    {
      id: "tradicional",
      name: "Tradicional",
      category: "Prato do dia",
      description: "Arroz, feijão carioca, bife de boi, alface e batata frita.",
      price: 30,
      discount: 25,
      image: "images/Tradicional.png",
      daySpecial: true
    },
    {
      id: "strogonoff",
      name: "Strogonoff",
      category: "Pratos",
      description: "Arroz, strogonoff de frango, batata palha e tomate.",
      price: 25,
      image: "images/Strogonoff.png"
    },
    {
      id: "macarrao",
      name: "Macarrão",
      category: "Pratos",
      description: "Macarrão com bacon crocante e alface fresca.",
      price: 18,
      image: "images/Macarrão.png"
    },
    {
      id: "batata-frita",
      name: "Porção de Batata Frita",
      category: "Porções",
      description: "Batatas fritas crocantes servidas em porção individual.",
      price: 10,
      image: "images/Batata.png"
    },
    {
      id: "tilapia",
      name: "Porção de Tilápia",
      category: "Porções",
      description: "Iscas de tilápia douradas e sequinhas.",
      price: 15,
      image: "images/Tilápia.png"
    },
    {
      id: "coca-lata",
      name: "Coca Cola - Lata 350ml",
      category: "Bebidas",
      description: "Refrigerante lata 350ml.",
      price: 5,
      image: "images/Coca Cola Lata.png"
    },
    {
      id: "coca-1l",
      name: "Coca Cola - 1L",
      category: "Bebidas",
      description: "Refrigerante garrafa 1 litro.",
      price: 10,
      image: "images/Coca Cola Garrafa.png"
    },
    {
      id: "guarana-lata",
      name: "Guaraná - Lata 350ml",
      category: "Bebidas",
      description: "Refrigerante guaraná lata 350ml.",
      price: 5,
      image: "images/Guaraná Lata.png"
    },
    {
      id: "guarana-1l",
      name: "Guaraná - 1L",
      category: "Bebidas",
      description: "Refrigerante guaraná garrafa 1 litro.",
      price: 10,
      image: "images/Guaraná Garrafa.png"
    }
  ],
  cart: [],
  orders: [],
  rewards: [
    {
      id: "reward-coca-lata",
      name: "Coca Cola - Lata 350ml",
      cost: 10,
      itemId: "coca-lata"
    }
  ]
};


