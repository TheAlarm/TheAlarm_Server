const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const express = require('express');

const router = express.Router();

const options = {
    //swagger문서 설정
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Alarm API Docs',
            version: '1.0.0',
            description: 'Alarm API 문서입니다',
        },
        host: 'localhost:3232',
        basePath: '/',
        servers: [
            {
                url: 'http://localhost:3232'
            }
        ]
    },
    //swagger api가 존재하는 곳 입니다.
    apis: ['./src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;