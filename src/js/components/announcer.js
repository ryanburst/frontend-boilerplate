/**
 * Utility class for announcing dynamic changes
 * on the page for a screen reader.
 *
 *
 * @class Announcer
 */
class Announcer {
  /**
   * Creates an instance of Announcer.
   * @memberof Announcer
   */
  constructor() {
    this.announcementContainer = document.querySelector('#announcer');
  }
  /**
   * Creates a p tag with content and appends it to the announcement container.
   *
   * @param String content
   * @memberof Announcer
   */
  createAnnouncement(content) {
    let announcement = document.createElement('P');
    announcement.textContent = content;
    this.announcementContainer.appendChild(announcement);
  }

  /**
   * Clears the announcement container.
   *
   * @memberof Announcer
   */
  clearAnnouncement() {
    this.announcementContainer.removeChild(this.announcementContainer.querySelector('p'));
  }

  /**
   * Clears the announcement container and then appends
   * the new content to be announced.
   *
   * @param String announcement
   * @memberof Announcer
   */
  say(announcement) {
    this.clearAnnouncement();
    this.createAnnouncement(announcement);
  }
}

export {Announcer as default };