# Mailer Module

Module to send email, optionally with templates.

Provides a pre-configured `nodemailer` wrapper that can send emails with
templates written in [nunjucks](https://mozilla.github.io/nunjucks/).

## Configuration

Options are retrieved from environment variables:

```bash
SMTP_HOST=localhost # default, optional
SMTP_USER=user # required
SMTP_PASS=pass # required
SMTP_PORT=54325 # example for supabase inbucket; default 25, optional
SMTP_TLS=true # enable TLS by passing the literal `true`; default undefined (false), optional
```

## Usage

Inject the [`MailerService`](./mailer.service.ts) in the code you want to send
emails in.

Call the `send` method directly providing payload options as below:

```js
// where `mailerService` is the injected mailer service
await mailerService.send({
  // template path can be relative or absolute path
  template: "the-template",
  message: {
    to: "recipent@example.com",
    from: "sender@example.com",
  },
  locals: {
    var: "a variable expected in your email template",
  },
});
```

Example included in [tests](./mailer.test.ts).

For advanced usage, you can retrieve the underlying email service:
`mailerService.getMailer()`.

### Usage in development/test environments

We can use the `inbucket` instance from supabase for local delivery. Use any
`SMTP_USER` and `SMTP_PASS` values; but do not leave blank.

## References

- [`email-templates`](https://github.com/forwardemail/email-templates?tab=readme-ov-file):
  this provides the integration/wrapper for `nodemailer` with templates and
  other options
- [`nunjucks`](https://mozilla.github.io/nunjucks/templating.html): the
  pre-configured templating engine similar to jinja and twig
