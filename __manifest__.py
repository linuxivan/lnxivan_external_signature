# -*- coding: utf-8 -*-
{
    'name' : 'Linuxivan External Signature',
    'version' : '1.0',
    'summary': 'Adds the option of sign documents with external signature',
    'category': 'Web',
    'depends' : ['base', 'web', 'stock'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/signature_screen.xml',
    ],
    'installable': True,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'owl/static/src/components/*/*.js',
            'owl/static/src/components/*/*.xml',
            'owl/static/src/components/*/*.scss',
        ],
    },
}