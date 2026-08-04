/** 温控阀的工作模式 */
export enum EThermostatWorkMode {
  /** 手动模式 */
  MANUAL,
  /** 关闭（防霜冻）模式 */
  ECO ,
  /** 自动模式 */
  AUTO,
  /** 快速升温模式 */
  BOOST,
  /** 定时模式 */
  TIMER,
}

/** 工作状态 */
export enum EAdaptiveRecoveryStatus {
  /** 保温中 */
  INACTIVE,
  /** 加热中 */
  HEATING,

}

/** 星期几枚举 */
export enum EWeekDay {
    /** 周日 */
    SUNDAY = 'Sunday',
    /** 周一 */
    MONDAY = 'Monday',
    /** 周二 */
    TUESDAY = 'Tuesday',
    /** 周三 */
    WEDNESDAY = 'Wednesday',
    /** 周四 */
    THURSDAY = 'Thursday',
    /** 周五 */
    FRIDAY = 'Friday',
    /** 周六 */
    SATURDAY = 'Saturday'
}
