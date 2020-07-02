import { injectable, inject } from 'tsyringe';
import { getDaysInMonth, getDate, getHours } from 'date-fns';

import IAppointmentRepository from '@modules/appointments/repositories/IAppointmentsRepository';

// import User from '@modules/users/infra/typeorm/entities/User';

interface IRequest {
  provider_id: string;
  day: number;
  month: number;
  year: number;
}

type IResponse = Array<{
  hour: number;
  available: boolean;
}>;

@injectable()
class ListProviderDailyAvailabilityService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentRepository,
  ) {}

  public async execute({
    provider_id,
    year,
    month,
    day,
  }: IRequest): Promise<IResponse> {
    const appointments = await this.appointmentsRepository.findDailyAvailabilityProvider(
      {
        provider_id,
        year,
        month,
        day,
      },
    );

    const startHour = 8;

    const everyHourArray = Array.from(
      { length: 10 },
      (_, index) => index + startHour,
    );

    const availability = everyHourArray.map(hour => {
      const duringAppointmentHour = appointments.find(
        appointment => getHours(appointment.date) === hour,
      );

      return {
        hour,
        available: !duringAppointmentHour,
      };
    });
    return availability;
  }
}

export default ListProviderDailyAvailabilityService;
