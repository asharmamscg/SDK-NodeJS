import axios from 'axios'
import { forEach } from 'lodash'

import constants from '../constants'
import RecastError from './error'
import Entity from './entity'

export default class Converse {

  constructor (response) {
    this.raw = response

    this.source = response.source
    this.replies = response.replies
    this.action = response.action
    this.nextActions = response.next_actions
    this.memory = response.memory

    this.entities = []
    forEach(response.entities, (value, key) => {
      value.forEach(entity => this.entities.push(new Entity(key, entity)))
    })

    this.intents = response.intents
    this.conversationToken = response.conversation_token

    this.language = response.language
    this.timestamp = response.timestamp
    this.status = response.status
  }

  /**
   * Returns the first reply if there is one
   * @returns {String}: this first reply or null
   */
  reply = () => this.replies[0] || null

  /**
   * Returns a concatenation of the replies
   * @returns {String}: the concatenation of the replies
   */
  joinedReplies = (sep = ' ') => this.replies.join(sep)

  /**
   * Returns the memory matching the alias
   * or all the memory if no alias provided
   * @returns {object}: the memory
   */
  getMemory = alias => alias ? this.memory[alias] : this.memory

  /**
   * Merge the conversation memory with the one in parameter
   * Returns the memory updated
   * @returns {object}: the memory updated
   */
  static setMemory (token, conversation_token, memory) {
    const data = { conversation_token, memory: JSON.stringify(memory) }
    const request = {
      method: 'put',
      url: constants.CONVERSE_ENDPOINT,
      headers: { Authorization: `Token ${token}` },
      data,
    }

    return new Promise((resolve, reject) => {
      axios(request)
        .then(res => resolve(res.data.results))
        .catch(err => reject(new RecastError(err.message)))
    })
  }

  /**
   * Reset the memory of the conversation
   * @returns {object}: the updated memory
   */
  static resetMemory (token, conversation_token, alias) {
    const memory = {}
    memory[alias] = null
    const data = { conversation_token, memory: JSON.stringify(memory) }
    const request = {
      method: 'put',
      url: constants.CONVERSE_ENDPOINT,
      headers: { Authorization: `Token ${token}` },
      data,
    }

    return new Promise((resolve, reject) => {
      axios(request)
        .then(res => resolve(res.data.results))
        .catch(err => reject(new RecastError(err.message)))
    })
  }

  /**
   * Reset the conversation
   * @returns {object}: the updated memory
   */
  static resetConversation (token, conversation_token) {
    const request = {
      method: 'delete',
      url: constants.CONVERSE_ENDPOINT,
      headers: { Authorization: `Token ${token}` },
      data: { conversation_token },
    }

    return new Promise((resolve, reject) => {
      axios(request)
        .then(res => resolve(res.data.results))
        .catch(err => reject(new RecastError(err.message)))
    })
  }
}
