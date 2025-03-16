import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/config/app-config";
import Email from 'email-templates';
import type { SentMessageInfo } from "nodemailer/lib/smtp-connection";

@Injectable()
export class MailerService {
  private mailer: Email;
  private defaultFrom: string | undefined;
  constructor(config: ConfigService<EnvironmentVariables>) {
    const user = config.getOrThrow<string>('SMTP_USER');
    const pass = config.getOrThrow<string>('SMTP_PASS');
    const host = config.get<string>('SMTP_HOST');
    const port = config.get<number | string>('SMTP_PORT');
    const secure = config.get<boolean>('SMTP_TLS');
    this.defaultFrom = config.get<string>('SMTP_FROM');

    this.mailer = new Email({
      transport: {
        host,
        port: port ? parseInt(port.toString(), 10) : undefined,
        secure,
        auth: {
          user,
          pass
        }
      },
      // send emails even in development or test
      send: true,
      views: {
        options: {
          // expect nunjucks templates
          extension: 'njk'
        }
      }
    })
  }

  getMailer() {
    return this.mailer;
  }

  async send(options: Email.EmailOptions) {
    if (options.message && !options.message.from) {
      options.message.from = this.defaultFrom;
    }

    const messageInfo = (await this.mailer.send(options)) as SentMessageInfo;
    return messageInfo;
  }
}
