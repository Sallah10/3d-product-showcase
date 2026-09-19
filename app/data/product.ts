interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  modelPath: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Air Sneaker Pro",
    description: "Premium running shoes with nano-cushion",
    price: "$188.99",
    modelPath: "/models/red_snickers/red_snickers_scene.glb",
  },
  {
    id: 2,
    title: "Sport Watch X",
    description: "Waterproof smartwatch with heart monitor",
    price: "$148.99",
    modelPath: "/models/sport_watch/sport_watch_scene.glb",
  },
  {
    id: 3,
    title: "Blue Hills",
    description: "Stylish shoe for all seasons party",
    price: "$129.99",
    modelPath: "/models/blue_hills/blue_hills_scene.glb",
  },
];
