export enum ClientEvent {
  PRESENCE_STATUS = 'client_presence_status',
  CHAT_MESSAGE = 'client_chat_message',
  SETTINGS_CHANGE = 'client_settings_change',
  RUN_CODE = 'client_run_code'
}

export enum ServerEvent {
  ROOM_STATE_UPDATE = 'room_state_update',
  ROOM_CHAT_UPDATE = 'room_chat_update',
  CODE_EXECUTION_LOG = 'code_execution_log'
}
