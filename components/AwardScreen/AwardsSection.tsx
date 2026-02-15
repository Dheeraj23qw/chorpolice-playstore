import React from "react";
import { AwardRow } from "@/components/AwardScreen/AwardRow";

interface Props {
  collections: any[];
  cardWidth: number;
  getRarityStyles: (rarity: string) => any;
}

export default function AwardsSection({ collections, cardWidth, getRarityStyles }: Props) {
  return (
    <>
      {collections.map(section => (
        <AwardRow
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          data={section.data}
          cardWidth={cardWidth}
          getRarityStyles={getRarityStyles}
        />
      ))}
    </>
  );
}
