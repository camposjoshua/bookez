// 0 - cancelled, 1 - upcoming, 2 - completed, 3 - done, 4 - no show, 5 - dayoff, 6 - leave
type sessionStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type sessionType = 'hour' | 'half-hour' | 'off';
type questionnaireStatus = 0 | 1; // 0 - expired, 1 - valid

export interface SessionProps {
  id?: string;
  company?: string;
  //session details
  date: any;
  status: sessionStatus;
  time_end: number; // in ms
  time_start: number; // in ms
  date_created: any;
  date_stamp: number; // time at 00:00:00 in ms
  buffer: number; // in ms
  type: sessionType;

  //hopeliner info
  hopeliner_id: string | undefined | null;
  hopeliner_img: string;
  hopeliner_name: string;
  hopeliner_email: string;

  //user info | client info
  user_id: string | undefined | null;
  user_img: string;
  user_name: string | null | undefined;
  user_email: string;

  // google info
  gmeetlink?: string;

  //Session Notes
  chatRoomId?: undefined | null;
  session_notes?: undefined | null;
  contact_reason?: undefined | null;
  questionaire_id?: undefined | null;
}

export interface LeaveRequestProps extends SessionProps {
  id?: any;
  leave_status: 0 | 1 | 2 | 3 | 4;
  archive: boolean;
}

export interface QuestionnaireProps {
  respondent_answers: any[];
  hopeliner_id: string | undefined | null;
  respondent_id: string | undefined | null;
  respondent_score: number | null;
  session_id?: string;
  date_created: number;
  valid_until: number;
  type: string;
  status: questionnaireStatus;
}

export type UserProps = {
  dateCreated: any;
  company?: string;
  email: string;
  fname: string;
  img: string;
  is_verified: boolean;
  lname: string;
  name: string;
  token: string;
  user_id: string;
  user_type: number;
};

interface StatusChipProps {
  status: 0 | 1 | 2 | 3 | 4;
}
