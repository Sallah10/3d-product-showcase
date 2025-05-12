interface Product {
  id: number;
  title: string;
  description: string;
  modelPath: string;
}
//   const features = [
//         { id: 'feature1', name: 'Premium Materials', description: 'Made with high-quality sustainable materials' },
//         { id: 'feature2', name: 'Ergonomic Design', description: 'Crafted for maximum comfort and usability' },
//         { id: 'feature3', name: 'Smart Technology', description: 'Embedded sensors for enhanced performance' },
//     ];

export const products: Product[] = [
  {
    id: 1,
    title: "Air Sneaker Pro",
    description: "Premium running shoes with nano-cushion",
    modelPath: "/models/red_sneakers/scene.gltf"
  },
  {
    id: 2,
    title: "Sport Watch X",
    description: "Waterproof smartwatch with heart monitor",
    modelPath: "/models/blue_hills/scene.gltf"
  }
];