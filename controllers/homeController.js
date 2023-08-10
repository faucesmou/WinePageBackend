import fs from 'fs';
import path from 'path';

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
    getLanding: (req, res) => {
        let landingPageURL = 'https://www.antoniomaswines.createch.com.ar/';
        res.redirect(landingPageURL);
    }

};

export default controller;
