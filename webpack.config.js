const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',  // Aquí asegúrate de apuntar a tu archivo de entrada principal
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Para manejar archivos .js y .jsx
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/, // Si estás usando CSS
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Para importar sin escribir extensiones
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Usa tu archivo HTML principal
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000, // Cambia esto si tu puerto es diferente
  },
};
