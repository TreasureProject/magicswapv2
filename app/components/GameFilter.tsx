import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";

type Props = {
  games: {
    id: string;
    name: string;
    image: string;
  }[];
  selectedGameId?: string;
  onChange: (gameId: string) => void;
  onClear: () => void;
};

export const GameFilter = ({
  games,
  selectedGameId,
  onChange,
  onClear,
}: Props) => {
  const selectedGame = selectedGameId
    ? games.find((game) => game.id === selectedGameId)
    : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-1.5 border border-night-500 bg-night-700"
        >
          {selectedGame ? (
            <>
              <img
                src={selectedGame.image}
                alt=""
                className="h-5 w-5 rounded"
              />
              {selectedGame.name}
            </>
          ) : (
            "All Games"
          )}
          <ChevronDownIcon className="h-3.5 w-3.5 text-silver-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 font-medium text-white"
            onClick={onClear}
          >
            All Games
            {!selectedGame ? <CheckIcon className="h-4 w-4" /> : null}
          </button>
        </DropdownMenuItem>
        {games.map(({ id, name, image }) => (
          <DropdownMenuItem key={id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 font-medium text-white"
              onClick={() => onChange(id)}
            >
              <span className="flex items-center gap-2">
                <img src={image} alt="" className="h-5 w-5 rounded" />
                {name}
              </span>
              {id === selectedGameId ? <CheckIcon className="h-4 w-4" /> : null}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
