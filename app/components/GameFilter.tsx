import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";
import { GAME_METADATA } from "~/consts";

type Props = {
  selectedGameId?: string;
  onChange: (gameId: string) => void;
  onClear: () => void;
};

export const GameFilter = ({ selectedGameId, onChange, onClear }: Props) => {
  const selectedGame = selectedGameId
    ? GAME_METADATA[selectedGameId]
    : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-1.5 border border-night-900 bg-night-1100"
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
          <ChevronDownIcon className="h-3.5 w-3.5 text-night-600" />
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
        {Object.entries(GAME_METADATA).map(([id, { name, image }]) => (
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
