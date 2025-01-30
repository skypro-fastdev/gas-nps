/*

Класс отвечает за вытаскивание всякой информации из диалога с пользователем.

*/

class Dialog {

  constructor(messages){
    this.messages = messages
    this.senderID = SLAVA_ID
  }

  get number(){
    return this.messages.length
  }

  get latest_by(){

      if (this.number === 0) { return null; }
      const latestPost = this.messages[this.number-1]
      return (latestPost.user_id == this.senderID) ? "bot" : "student";

  }

  get latest_message(){

    if (this.number === 0) { return null }
    const latestPost = this.messages[this.number-1]
    return latestPost.message

  }

  get referral_mentioned_at(){

    let latestDate = null
    for (const oneMessage of this.messages){

        const start = new Date("2025-01-14");
        const end = new Date("2025-02-14");
        const messageDate = new Date(oneMessage.create_at);

        if (messageDate < start || messageDate > end) {continue;}

        if (oneMessage.message.includes('referral')){
          latestDate = new Date(oneMessage.create_at)
        }
    }
    return latestDate
  }

  get userMessageCount() {
    let userMessageCount = 0;
    for (const message of this.messages) {
      if (message.user_id != this.senderID) {
        userMessageCount++;
      }
    }
    return userMessageCount;
  }

  getUserMessages(startDate, endDate) {
    const start = new Date("2025-01-14");
    const end = new Date("2025-02-14");

    return this.messages.filter(message => {
      const messageDate = new Date(message.create_at);
      return message.user_id !== this.senderID && messageDate >= start && messageDate <= end;
    }).map(message => message.message);
  }

  get isReferralMentioned(){
    return this.referral_mentioned_at != null
  }

}
