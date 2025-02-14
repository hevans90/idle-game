import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

import { NodeGraphqlAPI } from '@idleverse/galaxy-gql';
import { HasuraQuestProgression } from '../datasources/hasura-quest-progression';

export const automaticMainQuestAssignment = async (
  client: ApolloClient<NormalizedCacheObject>,
  { addQuest }: HasuraQuestProgression
) => {
  const initialMainQuest =
    await client.query<NodeGraphqlAPI.InitialMainQuestIdQuery>({
      query: NodeGraphqlAPI.InitialMainQuestIdDocument,
    });

  const quest = initialMainQuest.data.quest[0];

  if (!quest) throw new Error('No initial main quest found!');

  return client
    .subscribe<NodeGraphqlAPI.EmpiresWithoutQuestsSubscription>({
      query: NodeGraphqlAPI.EmpiresWithoutQuestsDocument,
    })
    .subscribe({
      next: ({ data: { galactic_empire_aggregate } }) => {
        galactic_empire_aggregate.nodes.forEach(({ id: galactic_empire_id }) =>
          addQuest({
            galactic_empire_id,
            quest_id: quest.id,
            quest_step_id: quest.steps[0].id,
          }).then((x) =>
            console.log(
              'Initial main quest added:',
              x.data.insert_galactic_empire_quest_one
            )
          )
        );
      },
    });
};
