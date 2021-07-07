import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

interface IMsgParams {
  ToAddresses: string[],
  template: string,
  args?: any
}

@Injectable()
export class MessageService {
  constructor() { }

  async sendMessage(params: IMsgParams) {
    let { ToAddresses, template, args } = params
    // Provide the full path to your config.json file. 
    // AWS.config.loadFromPath('./aws.config.json');

    // Replace sender@example.com with your "From" address.
    // This address must be verified with Amazon SES.
    const sender = "tom lee <xu3cl40122@gmail.com>";

    let Message
    switch (template) {
      case 'VERIFY_EMAIL':
        Message = this.setVerificationCodeTemplate(args)
      default:
        break;
    }

    // Create a new SES object. 
    let ses = new AWS.SES();

    // Specify the parameters to pass to the API.
    let option = {
      Source: sender,
      Destination: {
        ToAddresses
      },
      Message
    };

    //Try to send the email.
    return new Promise((resolve, reject) => {
      ses.sendEmail(option, function (err, data) {
        err ? reject(err) : resolve(data)
      })
    })

  }

  // 驗證碼信件 template
  setVerificationCodeTemplate(args: { verification_code: string, verification_type: string }): Object {
    const useForMap = {
      ENABLE_ACCOUNT: '啟用帳號',
      FORGOT_PASSWORD : '忘記密碼'
    }
    let useFor = useForMap[args.verification_type]
    const charset = "UTF-8";
    const subject = `GO COURT ${useFor}驗證信`
    const body_text = `您的${useFor}驗證碼為 ${args.verification_code}`
    const body_html = `<html>
<body>
  <h4>您的${useFor}驗證碼為</h4>
  <h2>${args.verification_code}</h2>

  <p>GO COURT Team</p>
</body>
</html>`;

    return {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: body_text,
          Charset: charset
        },
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    }

  }

}
