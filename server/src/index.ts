import 'dotenv/config';
import App from './App';

const PORT = parseInt(process.env.PORT || '3000', 10);

App.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on Port ${PORT}`);
});