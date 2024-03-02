# Copyright Ivan Perez Louzan <http://www.lnxivan.com>
from odoo import models, fields, api


class SignatureScreen(models.Model):
    _name = 'signature.screen'
    _description = 'Signature Screen'

    text = fields.Text(string='Text')
    description = fields.Text(string='Description')
    image = fields.Binary(string='Image')

    signature_session_id = fields.One2many('signature.session', 'signature_screen_id', string='Signature Session')


class SignatureSession(models.Model):
    _name = 'signature.session'
    _description = 'Signature Session'

    signature_screen_id = fields.Many2one('signature.screen', string='Signature Screen')
    image = fields.Binary(string='Image', related='signature_screen_id.image')
    signature = fields.Binary(string='Signature', default=False)
    user_id = fields.Many2one('res.users', string='User')
    date = fields.Datetime(string='Date', default=fields.Datetime.now)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('started', 'Started'),
        ('done', 'Done'),
    ], string='State', default='draft')

    picking_id = fields.Many2one('stock.picking', string='Picking', default=False)

    def action_done(self):
        self.state = 'done'
        return True

    def action_start(self):
        self.state = 'started'
        return True

    def action_draft(self):
        self.state = 'draft'
        return True