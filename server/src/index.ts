import 'dotenv/config';
import App from './App.ts';

const PORT = process.env.PORT || 3000;

App.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});