import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import { MailerService } from './mailer.service';
import { MailerModule } from './mailer.module';

describe('MailerService', () => {
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), MailerModule],
      providers: [MailerService],
    }).compile();

    mailerService = moduleRef.get(MailerService);
  });

  describe('send', () => {
    it('can send mail with a template', async () => {
      const recepient = 'email@example.com';
      const msgInfo = await mailerService.send({
        // our template is provided as an absolute path to ./test/hello
        template: join(__dirname, 'test', 'hello'),
        message: {
          to: recepient,
          // subject: 'included in template'
          // html: 'included in template',
          // text: 'extracted from html'
        },
        locals: {
          name: 'Test User',
        },
      });

      // console.log(msgInfo);
      expect(msgInfo.accepted).toContain(recepient);
    });
  });
});
