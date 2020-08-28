import api from './api'
import DateCalc from '../services/DateCalc'

export default class TimeClock {

  static async read(userId, date) {
    try {
      const response = await api.get(`/timeclock/${userId}/${date}`)
      return response.data
    } catch (e) {
      if (e.request.status == 404) {
        return {
          work_duration: 0,
        }
      }
      throw e
    }
  }

  static async punch(userId) {
    const date = DateCalc.isoDate()
    const timeToRecord = DateCalc.getTimeString()
    let record = {}
    try {
      const response = await api.get(`/timeclock/${userId}/${date}`)
      record = response.data
    } catch (e) {
      if (e.request.status != 404) {
        throw e
      }
    }
    if (record.json_log) {
      const jsonLog = JSON.parse(record.json_log)
      if (jsonLog[jsonLog.length - 1] > timeToRecord) {
        throw new Error('Time is not valid')
      }
      jsonLog.push(timeToRecord)
      record.json_log = JSON.stringify(jsonLog)
      record.departure_time = jsonLog.length % 2 == 0 ? timeToRecord : null
      record.work_duration = this.calcWorkDuration(jsonLog)
      record.updated_at = DateCalc.isoDateTime()
      await api.put(`/timeclock/${userId}/${date}`, record)
    } else {
      const jsonLog = [timeToRecord]
      record = {
        date: date,
        user_id: userId,
        arrival_time: timeToRecord,
        work_duration: 0,
        json_log: JSON.stringify(jsonLog),
        updated_at: DateCalc.isoDateTime()
      }
      await api.post(`/timeclock`, record)
    }
    return record
  }

  static calcWorkDuration(jsonLog) {
    let duration = 0
    for (let i = 0; i <= jsonLog.length; i += 2) {
      if (jsonLog.length > i + 1) {
        duration += DateCalc.hhmmssToSec(jsonLog[i + 1]) - DateCalc.hhmmssToSec(jsonLog[i])
      }
    }
    //console.log(`duration=${DateCalc.secToHhmmss(duration)}, (${duration}ms=${Math.round(duration/36) / 100})`)
    duration = Math.round(duration/36) / 100
    return duration
  }

}