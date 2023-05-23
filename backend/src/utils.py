from datetime import datetime, timezone
from typing import IO


def to_datetime(timestamp_str: str, unit: str):
    match unit:
        case 'ms':
            return datetime.fromtimestamp(int(timestamp_str[0:-3]), tz=timezone.utc)
        case 'ns':
            return datetime.fromtimestamp(int(timestamp_str[0:-9]), tz=timezone.utc)
        case 's':
            return datetime.fromtimestamp(int(timestamp_str), tz=timezone.utc)
        case _:
            raise ValueError(f'Unknown unit {unit}')


def create_activities_map(f: IO) -> dict[int | str, str | int]:
    activities_map = {}
    with f:
        for line_count, line in enumerate(f):
            if line_count == 0:
                continue
            line = line.strip().split(',')
            activity, integer = line[0], int(line[1])
            activities_map[integer] = activity
            activities_map[activity] = integer
    return activities_map


def hours_between_datetime(later_date: datetime, earlier_date: datetime) -> float:
    duration = later_date - earlier_date
    return duration.total_seconds() / 3600


activties_map = create_activities_map(open('activityMap.csv', 'r'))
black_list = {'Unknown (unable to detect activity)', 'Tilting (sudden device gravity change)',
             'In vehicle', 'Housework', 'Still (not moving)', 'Walking (fitness)', 'Walking (stroller)',
             'Walking (treadmill)'}


def get_all_activities() -> list[str]:
    return [key for key in activties_map.keys() if type(key) is str and key not in black_list]
