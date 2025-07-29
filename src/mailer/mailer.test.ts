import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import { MailerService } from './mailer.service';
import { MailerModule } from './mailer.module';
import { vi } from 'vitest';
import * as nunjucks from 'nunjucks';

describe('MailerService', () => {
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ 
          isGlobal: true,
          load: [() => ({
            SMTP_USER: 'test@example.com',
            SMTP_PASS: 'testpass',
            SMTP_HOST: 'localhost',
            SMTP_PORT: 1025,
            SMTP_TLS: false,
            SMTP_FROM: 'test@example.com'
          })]
        }), 
        MailerModule
      ],
      providers: [MailerService],
    }).compile();

    mailerService = moduleRef.get(MailerService);
  });

  describe('template rendering', () => {
    it('should render email template with variables correctly', async () => {
      const templatePath = join(__dirname, 'test', 'hello');
      const templateData = { name: 'Test User' };

      // Test HTML template rendering
      const htmlTemplate = join(templatePath, 'html.njk');
      const renderedHtml = nunjucks.render(htmlTemplate, templateData);
      
      expect(renderedHtml).toContain('<p>Hello Test User</p>');
      expect(renderedHtml).toContain('<p>We wanted to bring this greeting to your attention</p>');
      expect(renderedHtml).not.toContain('{{ name }}');

      // Test subject template rendering
      const subjectTemplate = join(templatePath, 'subject.njk');
      const renderedSubject = nunjucks.render(subjectTemplate, templateData);
      
      expect(renderedSubject).toBe('Attention Test User!');
      expect(renderedSubject).not.toContain('{{ name }}');
    });

    it('should handle missing template variables gracefully', async () => {
      const templatePath = join(__dirname, 'test', 'hello');
      const templateData = {}; // No name provided

      // Test HTML template with missing variable
      const htmlTemplate = join(templatePath, 'html.njk');
      const renderedHtml = nunjucks.render(htmlTemplate, templateData);
      
      expect(renderedHtml).toContain('<p>Hello </p>'); // Empty name
      expect(renderedHtml).toContain('<p>We wanted to bring this greeting to your attention</p>');

      // Test subject template with missing variable
      const subjectTemplate = join(templatePath, 'subject.njk');
      const renderedSubject = nunjucks.render(subjectTemplate, templateData);
      
      expect(renderedSubject).toBe('Attention !'); // Empty name
    });

    it('should render template with complex data structures', async () => {
      const templatePath = join(__dirname, 'test', 'hello');
      const templateData = {
        name: 'John Doe',
        user: {
          email: 'john@example.com',
          role: 'admin'
        },
        items: ['item1', 'item2', 'item3']
      };

      // Test HTML template with complex data
      const htmlTemplate = join(templatePath, 'html.njk');
      const renderedHtml = nunjucks.render(htmlTemplate, templateData);
      
      expect(renderedHtml).toContain('<p>Hello John Doe</p>');
      expect(renderedHtml).toContain('<p>We wanted to bring this greeting to your attention</p>');
    });
  });
});
