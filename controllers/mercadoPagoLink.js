
import dotenv from 'dotenv';
import mercadopago from 'mercadopago';

dotenv.config();

let linksMP = async (idUnico,periodo,valorFinal) => {
    try {

       /*  let access_token = dotenv.parsed.MERCADO_PAGO_ACCESS_TOKEN Cristian lo usa así.  */
       let access_token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

        mercadopago.configure({
            access_token
        })

        let preference = {
            back_urls: {
                failure: `https://www.antoniomaswines.createch.com.ar/`,
                pending: `https://www.antoniomaswines.createch.com.ar/`,
                success: `https://www.antoniomaswines.createch.com.ar/`
            },
            notification_url: `https://www.antoniomaswines.createch.com.ar/pagos/notification/${idUnico}`,
            items: [
                {
                    id: idUnico,
                    title: `Periodo vencido de ${parsearFecha(periodo)}`,
                    description: `conceptos a pagar durante el mes de ${parsearFecha(periodo)}`,
                    picture_url: "https://www.andessalud.com.ar/andes/assets/img/logoandes-blanco.png",
                    category_id: "category",
                    currency_id: "ARS",
                    quantity: 1,
                    unit_price: (valorFinal)
                }
            ],
            payment_methods: {
                excluded_payment_methods: [
                    {}
                ],
                excluded_payment_types: [
                    {}
                ]
            },
            external_reference: idUnico
        }

        let link = await mercadopago.preferences.create(preference)
        return link.body.init_point
    } catch (error) {
        console.error(error)
    }
}