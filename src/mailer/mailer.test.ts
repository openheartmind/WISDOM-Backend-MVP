import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import path from "path";
import defaults, { validate } from "src/config/app-config"
import { MailerService } from "./mailer.service"
import { MailerModule } from "./mailer.module";

describe('MailerService', () => {
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate,
          load: [defaults],
        }),
        MailerModule
      ],
      providers: [MailerService]
    }).compile();

    mailerService = moduleRef.get(MailerService);
  });

  describe('send', () => {
    it('can send mail with a template', async () => {
      // const mailer = mailerService.getMailer();
      await mailerService.send({
        template: path.join(__dirname, 'test', 'hello'),
        message: {
          to: 'email@example.com',
          from: 'Tester <test@example.com>'
        },
        locals: {
          name: 'Test User'
        }
      });
    });
  });
});
