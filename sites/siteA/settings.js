'use strict';

module.exports = {
    ports: {
        plain: [],
        secure: []
    },
    domains: [
        {name: 'www.example.com', certificate: 'path-to-cert', key: 'path-to-key'},
        {name: 'site1.example.com', certificate: 'path-to-cert', key: 'path-to-key'},
        {name: 'site2.example.com', certificate: 'path-to-cert', key: 'path-to-key'}
    ],
    domainRedirects: [
        {original: 'example.com', destination: 'www.example.com', code: 303}
    ],
    model: {
        languages: ['english', 'greek'],
        models: [
            {
                name: 'users',
                captions: ['Users','Χρήστες'],
                fields: [
                    {
                        name: 'firstName',
                        caption: [],
                        type: 'string',
                        type-options: {length: '10', validate: '.* .*'}
                    }, 
                    {
                        name: 'firstName',
                        multiLang: true,
                        caption: [],
                        type: 'string',
                        type-options: {length: '10', validate: '.* .*'}
                    }, 
                    {
                        name: 'firstName',
                        caption: [],
                        type: 'string',
                        type-options: {length: '10', validate: '.* .*'}
                    }, 
                ],
            }
        ],
    },
    
};
